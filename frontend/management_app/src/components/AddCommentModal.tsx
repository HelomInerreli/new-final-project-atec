import React from "react";
import { useAddCommentModal } from "../hooks/useAddCommentModal";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
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
          <Button 
            variant="outline" 
            onClick={onClose}
            type="button"
          >
            Cancelar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={loading || !comment.trim()}
                type="button"
              >
                {loading ? "Adicionando..." : "Adicionar Comentário"}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Adição de Comentário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja adicionar este comentário à ordem #{orderId}?
                  <div style={{ 
                    marginTop: "12px", 
                    padding: "12px", 
                    backgroundColor: "#f8f9fa", 
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    color: "#495057",
                    maxHeight: "100px",
                    overflowY: "auto"
                  }}>
                    <strong>Comentário:</strong><br />
                    {comment}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Sim, Adicionar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AddCommentModal;