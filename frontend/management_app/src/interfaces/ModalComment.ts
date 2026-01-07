// Interface para props do modal de adicionar comentário
export interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

// Interface para retorno do hook useAddCommentModal
export interface UseAddCommentModalReturn {
  comment: string;
  setComment: (comment: string) => void;
  commentError: string | null;
  loading: boolean;
  handleSubmit: () => Promise<void>;
}

// Função para validar comentário
export const validateComment = (comment: string): string | null => {
  if (!comment.trim()) {
    return "O comentário não pode estar vazio";
  }
  
  if (comment.trim().length < 3) {
    return "O comentário deve ter pelo menos 3 caracteres";
  }
  
  return null;
};