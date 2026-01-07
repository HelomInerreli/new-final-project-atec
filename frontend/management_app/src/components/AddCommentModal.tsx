/**
 * Componente modal para adicionar comentários a ordens de serviço.
 * Permite inserir texto e confirmar adição com diálogo de confirmação.
 */

import React from "react";
// Importa React
import { useAddCommentModal } from "../hooks/useAddCommentModal";
// Hook personalizado para modal
import { Button } from "./ui/button";
// Componente botão
import { toast } from "../hooks/use-toast";
// Hook para toasts
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
// Componentes do diálogo de alerta
import { type AddCommentModalProps } from "../interfaces/ModalComment";
// Tipo para props do modal
import "../styles/AddCommentModal.css";
// Estilos CSS

// Componente funcional para modal de adicionar comentário
const AddCommentModal: React.FC<AddCommentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}) => {
  // Usa hook personalizado
  const { comment, setComment, commentError, loading, handleSubmit } = useAddCommentModal(
    isOpen,
    orderId,
    onSuccess,
    onClose
  );

  // Não renderiza se não estiver aberto
  if (!isOpen) return null;

  // Renderiza overlay do modal
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
            className={`comment-modal-textarea ${commentError ? 'error' : ''}`}
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva seu comentário aqui..."
          />
          {commentError && <div className="comment-modal-error">{commentError}</div>}
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
                disabled={loading || !!commentError || !comment.trim()}
                type="button"
              >
                {loading ? "Adicionando..." : "Adicionar Comentário"}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader className="space-y-4">
                <AlertDialogTitle className="text-xl">Confirmar Adição de Comentário</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Tem certeza que deseja adicionar este comentário à ordem <span className="font-semibold text-red-600">#{orderId}</span>?
                  <div className="mt-4 p-4 bg-gray-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Comentário:</p>
                    <p className="text-sm text-gray-800 leading-relaxed max-h-32 overflow-y-auto">
                      {comment}
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter className="flex flex-row justify-center items-center gap-3 sm:flex-row sm:justify-center">
                <AlertDialogCancel className="hover:bg-gray-100 m-0">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSubmit}
                  className="bg-red-600 hover:bg-red-700 m-0"
                >
                  Adicionar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

// Exporta componente padrão
export default AddCommentModal;