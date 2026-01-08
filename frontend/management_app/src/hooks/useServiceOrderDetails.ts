import { useState, useEffect, useCallback } from "react";
import { getOrder, updateOrder, getCurrentWorkTime, startWork, pauseWork, resumeWork, finalizeWork } from "../services/OrderDetails";
import { normalizeStatus } from "./useServiceOrder";
import { STATUS_LABEL_TO_ID } from "../interfaces/ServiceOrderDetail";
import { format } from "date-fns";


/**
 * Hook para gerir detalhes de ordens de serviço
 * @param id - ID da ordem de serviço (opcional)
 * @returns Objeto com dados da ordem, estados, ações e funções auxiliares
 */
export const useServiceOrderDetails = (id: string | undefined) => {
  /**
   * Estado para armazenar os dados completos da ordem de serviço
   * Tipo: any | null
   * Inicia como null (sem dados)
   */
  const [order, setOrder] = useState<any | null>(null);

  /**
   * Estado para indicar se os dados estão sendo carregados
   * Tipo: boolean
   * Inicia como true para indicar que o carregamento está em progresso
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Estado para indicar se está a guardar alterações
   * Tipo: boolean
   * Inicia como false
   */
  const [saving, setSaving] = useState<boolean>(false);

  /**
   * Estado para controlar a abertura do modal de peças
   * Tipo: boolean
   * Inicia como false (modal fechado)
   */
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);

  /**
   * Estado para controlar a abertura do modal de comentários
   * Tipo: boolean
   * Inicia como false (modal fechado)
   */
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  /**
   * Estado para armazenar o tempo atual de trabalho em segundos
   * Tipo: number
   * Inicia como 0
   */
  const [currentTime, setCurrentTime] = useState<number>(0);

  /**
   * Função para buscar os dados da ordem de serviço
   * @param silent - Se true, não altera o estado de loading (para atualizações silenciosas)
   */
  /**
   * Função para buscar os dados da ordem de serviço
   * @param silent - Se true, não altera o estado de loading (para atualizações silenciosas)
   */
  const fetchOrder = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (e: any) {
      alert("Erro ao carregar ordem: " + (e?.message ?? e));
      setOrder(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  /**
   * Função para buscar o tempo atual de trabalho da ordem
   */
  /**
   * Função para buscar o tempo atual de trabalho da ordem
   */
  const fetchCurrentWorkTime = useCallback(async () => {
    if (!id) return;
    try {
      const time = await getCurrentWorkTime(id);
      setCurrentTime(time);
    } catch (e) {
      console.error("Erro ao buscar tempo de trabalho atual:", e);
    }
  }, [id]);


  /**
   * Efeito para carregar os dados iniciais da ordem
   * Executa ao montar o componente ou quando o ID muda!
   */
  useEffect(() => {
    fetchOrder();
    fetchCurrentWorkTime();
  }, [fetchOrder]);

  /**
   * Efeito para atualizar automaticamente os dados a cada 10 segundos
   * Executa atualizações silenciosas para manter os dados sincronizados
   */
  /**
   * Efeito para atualizar automaticamente os dados a cada 10 segundos
   * Executa atualizações silenciosas para manter os dados sincronizados
   */
  useEffect(() => {
    if (!id || !order) return;
    const interval = setInterval(() => {
      fetchOrder(true);
      fetchCurrentWorkTime();
    }, 10000);
    return () => clearInterval(interval);
  }, [id, order, fetchOrder, fetchCurrentWorkTime]);

  /**
   * Efeito para atualizar o contador de tempo em tempo real
   * Incrementa o tempo a cada segundo quando o trabalho está ativo e não pausado
   */
  /**
   * Efeito para atualizar o contador de tempo em tempo real
   * Incrementa o tempo a cada segundo quando o trabalho está ativo e não pausado
   */
  useEffect(() => {
    if (!order?.start_time || order?.is_paused) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [order?.start_time, order?.is_paused]);
  
  /**
   * Função para iniciar o trabalho numa ordem de serviço
   * Se o trabalho estiver pausado, retoma; caso contrário, inicia novo trabalho
   */
  /**
   * Função para iniciar o trabalho numa ordem de serviço
   * Se o trabalho estiver pausado, retoma; caso contrário, inicia novo trabalho
   */
  const handleStartWork = useCallback(async () => {
    console.log('handleStartWork called, id:', id, 'order?.is_paused:', order?.is_paused, 'order:', order);
    if (!id) return;
    try {
      if(order?.is_paused) {
        console.log('calling resumeWork for id ', id);
        await resumeWork(id);
      } else {
        console.log('calling startWork for id ', id);
        await startWork(id);
      }
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      console.error("Erro ao iniciar trabalho:", e);
      alert("Erro ao iniciar trabalho: " + e);
    }
  }, [id, order, fetchOrder, fetchCurrentWorkTime, resumeWork, startWork]);

  /**
   * Função para pausar o trabalho numa ordem de serviço
   */
  /**
   * Função para pausar o trabalho numa ordem de serviço
   */
  const handlePauseWork = useCallback(async () => {
    if (!id) return;
    try {
      await pauseWork(id);
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      alert("Erro ao pausar trabalho: " + e);
    }
  }, [id, fetchOrder, fetchCurrentWorkTime]);

  /**
   * Função para retomar o trabalho numa ordem de serviço pausada
   */
  const handleResumeWork = useCallback(async () => {
    if (!id) return;
    try {
      await resumeWork(id);
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      alert("Erro ao retomar trabalho: " + e);
    }
  }, [id, fetchOrder, fetchCurrentWorkTime]);

  /**
   * Função para finalizar o trabalho numa ordem de serviço
   */
  /**
   * Função para finalizar o trabalho numa ordem de serviço
   */
  const handleFinalizeWork = useCallback(async () => {
    if (!id) return;
    try {
      await finalizeWork(id);
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      alert("Erro ao finalizar trabalho: " + e);
    }
  }, [id, fetchOrder, fetchCurrentWorkTime]);



  /**
   * Função auxiliar para formatar campos genéricos
   * @param v - Valor a ser formatado
   * @returns String formatada ou "-" se valor for nulo/indefinido
   */
  /**
   * Função auxiliar para formatar campos genéricos
   * @param v - Valor a ser formatado
   * @returns String formatada ou "-" se valor for nulo/indefinido
   */
  const formatField = useCallback((v: any): string => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) return v.map(formatField).join(", ");
    if (typeof v === "object") return String(v.name ?? JSON.stringify(v));
    return String(v);
  }, []);

  /**
   * Função auxiliar para formatar datas
   * @param d - Data a ser formatada
   * @returns Data formatada no formato pt-PT ou "-" se inválida
   */
  /**
   * Função auxiliar para formatar datas
   * @param d - Data a ser formatada
   * @returns Data formatada no formato pt-PT ou "-" se inválida
   */
  const formatDate = useCallback((d: any): string => {
  if (!d) return "-";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      
      const datePart = dt.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      
      const timePart = dt.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit"
      });
      
      return `${datePart} ${timePart}`;
    } catch {
      return String(d);
    }
  }, []);

  /**
   * Função auxiliar para formatar tempo em segundos para HH:MM:SS
   * @param seconds - Tempo em segundos
   * @returns Tempo formatado no formato HH:MM:SS
   */
  /**
   * Função auxiliar para formatar tempo em segundos para HH:MM:SS
   * @param seconds - Tempo em segundos
   * @returns Tempo formatado no formato HH:MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Função auxiliar para formatar informações de veículo
   * @param v - Dados do veículo
   * @returns String com marca, modelo, matrícula e quilómetros formatados
   */
  /**
   * Função auxiliar para formatar informações de veículo
   * @param v - Dados do veículo
   * @returns String com marca, modelo, matrícula e quilómetros formatados
   */
  const formatVehicle = useCallback((v: any): string => {
    if (!v) return "-";
    if (typeof v === "string") return v;
    const plate = v.plate ?? "";
    const brand = v.brand ?? "";
    const model = v.model ?? "";
    const km = v.kilometers ?? null;
    const parts = [brand, model, plate].filter(Boolean);
    if (km) parts.push(`${km} km`);
    return parts.join(" ") || "-";
  }, []);

  /**
   * Função auxiliar para obter o nome bruto do status
   * @param o - Ordem ou objeto de status
   * @returns Nome do status como string
   */
  /**
   * Função auxiliar para obter o nome bruto do status
   * @param o - Ordem ou objeto de status
   * @returns Nome do status como string
   */
  const getRawStatusName = useCallback((o: any): string => {
    if (!o) return "";
    const s = o.status ?? o;
    if (!s) return "";
    if (typeof s === "string") return s;
    if (typeof s === "object") return String(s.name ?? "");
    return "";
  }, []);

  /**
   * Função para alterar o status da ordem de serviço
   * @param action - Ação a executar: "start", "pause" ou "finish"
   */
  const changeStatus = useCallback(async (action: "start" | "pause" | "finish") => {
    if (!id || !order) return;

    const newStatusLabel = action === "start" ? "Em Andamento" : action === "pause" ? "Pendente" : "Concluída";
    const currentRaw = getRawStatusName(order);
    const currentNormalized = normalizeStatus(currentRaw);

    if (currentNormalized === newStatusLabel) return;
    if (currentNormalized === "Concluída" && action !== "finish") {
      alert("Ordem já concluída.");
      return;
    }
    
    const newStatusId = STATUS_LABEL_TO_ID[newStatusLabel];
    if (!newStatusId) {
      alert("Status inválido");
      return;
    }

    setSaving(true);
    const previous = order;
    setOrder({ ...order, status_id: newStatusId });

    try {
      await updateOrder(id, { status_id: newStatusId });
      await fetchOrder();
    } catch (e: any) {
      setOrder(previous);
      alert("Erro ao atualizar status.");
    } finally {
      setSaving(false);
    }
  }, [id, order, getRawStatusName, fetchOrder]);

  /**
   * Array de comentários ordenados por data de criação (mais recentes primeiro)
   * Tipo: Array de comentários
   */
  /**
   * Array de comentários ordenados por data de criação (mais recentes primeiro)
   * Tipo: Array de comentários
   */
  const comments = (order?.comments ?? []).slice().sort((a: any, b: any) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return tb - ta;
  });

  /**
   * Array de peças ordenadas por data de criação (mais recentes primeiro)
   * Tipo: Array de peças
   */
  /**
   * Array de peças ordenadas por data de criação (mais recentes primeiro)
   * Tipo: Array de peças
   */
  const parts = (order?.parts ?? []).slice().sort((a: any, b: any) => {
    const ta = new Date(a.created_at ?? 0).getTime();
    const tb = new Date(b.created_at ?? 0).getTime();
    return tb - ta;
  });

  /**
   * Função para apagar um comentário
   * @param commentId - ID do comentário a apagar
   */
  /**
   * Função para apagar um comentário
   * @param commentId - ID do comentário a apagar
   */
  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (!id) return;
    try {
      const { deleteComment } = await import("../services/OrderDetails");
      await deleteComment(id, commentId);
      await fetchOrder();
    } catch (e) {
      alert("Erro ao apagar comentário: " + e);
    }
  }, [id, fetchOrder]);

  /**
   * Função para apagar uma peça
   * @param partId - ID da peça a apagar
   */
  /**
   * Função para apagar uma peça
   * @param partId - ID da peça a apagar
   */
  const handleDeletePart = useCallback(async (partId: number) => {
    if (!id) return;
    try {
      const { deletePart } = await import("../services/OrderDetails");
      await deletePart(id, partId);
      await fetchOrder();
    } catch (e) {
      alert("Erro ao apagar peça: " + e);
    }
  }, [id, fetchOrder]);

  /**
   * Nome bruto do status atual da ordem
   */
  const currentRaw = getRawStatusName(order);

  /**
   * Nome normalizado do status atual da ordem
   */
  const currentNormalized = normalizeStatus(currentRaw);

  return {
    /**
     * Estado da ordem de serviço
     */
    order,

    /**
     * Estado de carregamento
     */
    loading,

    /**
     * Estado de guardar alterações
     */
    saving,

    /**
     * Estado do modal de peças
     */
    isPartsModalOpen,

    /**
     * Estado do modal de comentários
     */
    isCommentModalOpen,

    /**
     * Array de comentários ordenados
     */
    comments,

    /**
     * Array de peças ordenadas
     */
    parts,

    /**
     * Status atual normalizado
     */
    currentNormalized,

    /**
     * Tempo atual de trabalho em segundos
     */
    currentTime,

    /**
     * Função para definir estado do modal de peças
     */
    setIsPartsModalOpen,

    /**
     * Função para definir estado do modal de comentários
     */
    setIsCommentModalOpen,

    /**
     * Função para alterar o status da ordem
     */
    changeStatus,

    /**
     * Função para recarregar dados da ordem
     */
    fetchOrder,

    /**
     * Função para iniciar trabalho
     */
    handleStartWork,

    /**
     * Função para pausar trabalho
     */
    handlePauseWork,

    /**
     * Função para retomar trabalho
     */
    handleResumeWork,

    /**
     * Função para finalizar trabalho
     */
    handleFinalizeWork,

    /**
     * Função para apagar comentário
     */
    handleDeleteComment,

    /**
     * Função para apagar peça
     */
    handleDeletePart,

    /**
     * Função auxiliar para formatar campos
     */
    formatField,

    /**
     * Função auxiliar para formatar datas
     */
    formatDate,

    /**
     * Função auxiliar para formatar tempo
     */
    formatTime,

    /**
     * Função auxiliar para formatar veículo
     */
    formatVehicle,
  };
};