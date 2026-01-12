import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface ConfirmationModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
}

/**
 * Modal reutilizável para confirmações
 * @param show - Controla a visibilidade do modal
 * @param title - Título do modal
 * @param message - Mensagem de confirmação
 * @param confirmText - Texto do botão de confirmação (padrão: "Confirmar")
 * @param cancelText - Texto do botão de cancelar (padrão: "Cancelar")
 * @param onConfirm - Callback ao confirmar
 * @param onCancel - Callback ao cancelar
 * @param variant - Cor do botão de confirmação (padrão: "primary")
 */
export function ConfirmationModal({
  show,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'primary',
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
      case 'warning':
        return <FaExclamationTriangle size={48} className="text-warning mb-3" />;
      case 'success':
        return <FaCheckCircle size={48} className="text-success mb-3" />;
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {getIcon()}
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
