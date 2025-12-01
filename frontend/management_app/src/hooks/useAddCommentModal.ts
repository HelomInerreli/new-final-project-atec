import { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";

export const useAddCommentModal = (isOpen: boolean, orderId: string, onSuccess: () => void, onClose: () => void) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validação (botão já está disabled no componente, mas mantemos por segurança)
    if (!comment.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/${orderId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: comment.trim() }),
        }
      );

      if (!response.ok) throw new Error("Erro ao adicionar comentário");

      setComment("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    comment,
    setComment,
    loading,
    handleSubmit,
  };
};