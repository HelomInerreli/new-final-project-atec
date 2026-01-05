import { useState } from "react";
import { type UseAddCommentModalReturn, validateComment } from "../interfaces/ModalComment";

import { toast } from "../hooks/use-toast";

const API_BASE_URL = "http://localhost:8000/api/v1";

const getAuthToken = () => {
  return localStorage.getItem("access_token");
};


export const useAddCommentModal = (
  isOpen: boolean,
  orderId: string,
  onSuccess: () => void,
  onClose: () => void
): UseAddCommentModalReturn => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleCommentChange = (value: string) => {
    setComment(value);
    const error = validateComment(value);
    setCommentError(error);
  };

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
    comment,
    setComment: handleCommentChange,
    commentError,
    loading,
    handleSubmit,
  };
};