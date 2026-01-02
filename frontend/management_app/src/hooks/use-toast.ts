import * as React from "react";

import type { ToastActionElement, ToastProps } from "../components/ui/toast";

/**
 * Número máximo de toasts que podem ser exibidos simultaneamente
 * Limitado a 1 para evitar sobrecarga visual
 */
const TOAST_LIMIT = 1;

/**
 * Tempo de atraso para remover um toast (em milissegundos)
 * Padrão: 3000ms (3 segundos)
 */
const TOAST_REMOVE_DELAY = 3000; // 3 segundos

/**
 * Tipo para representar um toast com todas as suas propriedades
 * Estende ToastProps e adiciona propriedades adicionais
 */
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number; // duração em ms (padrão: TOAST_REMOVE_DELAY)
};

/**
 * Tipos de ações disponíveis para o reducer
 * Define as operações que podem ser realizadas nos toasts
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

/**
 * Contador global para gerar IDs únicos para os toasts
 * Tipo: number
 */
let count = 0;

/**
 * Função para gerar um ID único para cada toast
 * Incrementa o contador e retorna como string
 * @returns ID único como string
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

/**
 * Tipo para representar os tipos de ação
 */
type ActionType = typeof actionTypes;

/**
 * União de tipos para representar todas as ações possíveis
 * Cada ação tem um tipo específico e payload associado
 */
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

/**
 * Interface para representar o estado dos toasts
 * Contém o array de todos os toasts ativos
 */
interface State {
  toasts: ToasterToast[];
}

/**
 * Mapa para armazenar os timeouts de remoção de cada toast
 * Chave: ID do toast, Valor: timeout de remoção
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Função para adicionar um toast à fila de remoção
 * Agenda a remoção automática do toast após a duração especificada
 * @param toastId - ID do toast a ser removido
 * @param duration - Duração antes da remoção (padrão: TOAST_REMOVE_DELAY)
 */
const addToRemoveQueue = (
  toastId: string,
  duration: number = TOAST_REMOVE_DELAY
) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer para gerir o estado dos toasts
 * Processa as ações e retorna o novo estado
 * @param state - Estado atual dos toasts
 * @param action - Ação a ser processada
 * @returns Novo estado após processar a ação
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        const toast = state.toasts.find((t) => t.id === toastId);
        addToRemoveQueue(toastId, toast?.duration || TOAST_REMOVE_DELAY);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id, toast.duration || TOAST_REMOVE_DELAY);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

/**
 * Array de funções listener que são notificadas quando o estado muda
 * Tipo: Array de funções que recebem o novo estado
 */
const listeners: Array<(state: State) => void> = [];

/**
 * Estado em memória compartilhado entre todos os componentes
 * Mantém a lista de toasts ativos
 * Tipo: State
 */
let memoryState: State = { toasts: [] };

/**
 * Função para despachar uma ação e notificar todos os listeners
 * Atualiza o estado em memória e propaga as mudanças
 * @param action - Ação a ser despachada
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Tipo para criar um toast, omitindo o ID que é gerado automaticamente
 */
type Toast = Omit<ToasterToast, "id">;

/**
 * Função para criar e exibir um novo toast
 * Gera automaticamente um ID único e agenda a remoção após a duração especificada
 * @param props - Propriedades do toast (título, descrição, variante, duração, etc.)
 * @returns Objeto com ID do toast e funções para dismissar e atualizar
 */
function toast({ ...props }: Toast) {
  const id = genId();
  const duration = props.duration || TOAST_REMOVE_DELAY;

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      duration,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto-dismiss após a duration
  setTimeout(() => {
    dismiss();
  }, duration);

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Hook para gerir toasts no componente
 * Subscreve às mudanças de estado e fornece funções para criar e dismissar toasts
 * @returns Objeto com estado atual, função toast e função dismiss
 */
function useToast() {
  /**
   * Estado local sincronizado com o estado em memória
   * Tipo: State
   */
  const [state, setState] = React.useState<State>(memoryState);

  /**
   * Efeito para subscrever às mudanças de estado
   * Adiciona o setState aos listeners ao montar
   * Remove o setState dos listeners ao desmontar
   */
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    /**
     * Estado atual com todos os toasts
     */
    ...state,
    
    /**
     * Função para criar um novo toast
     */
    toast,
    
    /**
     * Função para dismissar um toast específico ou todos
     * @param toastId - ID do toast a dismissar (opcional, se omitido dismissa todos)
     */
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
