/**
 * Hook personalizado para gerenciar o modal de adição de comentários a uma ordem de serviço.
 * Permite validar, submeter e gerenciar o estado do comentário.
 */

import { useState } from "react";
// Importa hook do React para estado
import { type UseAddCommentModalReturn, validateComment } from "../interfaces/ModalComment";
// Tipos e função de validação para comentários

import { toast } from "../hooks/use-toast";
// Hook para notificações toast

const API_BASE_URL = "http://localhost:8000/api/v1";
// URL base da API

// Função para obter token de autenticação do localStorage
const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

/**
 * Hook para gerenciar o modal de adição de comentários.
 * @param isOpen - Indica se o modal está aberto
 * @param orderId - ID da ordem de serviço
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar modal
 * @returns Objeto com estado e funções para o modal
 */
export const useAddCommentModal = (
  isOpen: boolean,
  orderId: string,
  onSuccess: () => void,
  onClose: () => void
): UseAddCommentModalReturn => {
  const [comment, setComment] = useState("");
  // Estado para o texto do comentário
  const [loading, setLoading] = useState(false);
  // Estado de carregamento
  const [commentError, setCommentError] = useState<string | null>(null);
  // Estado de erro de validação

  // Função para alterar o comentário e validar
  const handleCommentChange = (value: string) => {
    setComment(value);
    const error = validateComment(value);
    setCommentError(error);
  };

  // Função para submeter o comentário
  const handleSubmit = async () => {
    const validationError = validateComment(comment);
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/${orderId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ comment: comment.trim() }),
        }
      );

      if (!response.ok) throw new Error("Erro ao adicionar comentário");

      toast({
        title: "Comentário adicionado!",
        description: "O comentário foi adicionado com sucesso à ordem de serviço.",
        duration: 3000,
      });

      setComment("");
      setCommentError(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar comentário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    comment, // Texto do comentário
    setComment: handleCommentChange, // Função para alterar comentário
    commentError, // Erro de validação
    loading, // Indicador de carregamento
    handleSubmit, // Função para submeter
  };
};