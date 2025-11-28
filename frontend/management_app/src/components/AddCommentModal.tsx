import React from "react";
import { useAddCommentModal } from "../hooks/useAddCommentModal";
import "../styles/AddCommentModal.css";

interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const AddCommentModal: React.FC<AddCommentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}) => {
  const { comment, setComment, loading, handleSubmit } = useAddCommentModal(
    isOpen,
    orderId,
    onSuccess,
    onClose
  );

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>Adicionar Comentário</h3>
          <button className="comment-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="comment-modal-body">
          <label className="comment-modal-label">Comentário:</label>
          <textarea
            className="comment-modal-textarea"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva seu comentário aqui..."
          />
        </div>

        <div className="comment-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !comment.trim()}
          >
            {loading ? "Adicionando..." : "Adicionar Comentário"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCommentModal;