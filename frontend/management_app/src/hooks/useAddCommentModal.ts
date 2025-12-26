import { useState } from "react";
import { toast } from "sonner";
import { type UseAddCommentModalReturn, validateComment } from "../interfaces/ModalComment";

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


  const handleSubmit = async () => {
    const validationError = validateComment(comment);
    if (validationError) {
      toast.error(validationError);
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao adicionar comentário");
      }
    
      toast.success("Comentário adicionado com sucesso!");
      setComment("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar comentário:", error);
      toast.error(error.message || "Erro ao adicionar comentário");
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