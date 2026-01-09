import React from 'react';
import { XCircle } from 'lucide-react';

interface PaymentCancelledModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentCancelledModal: React.FC<PaymentCancelledModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleRetry = () => {
    // Volta para a página de appointments para tentar novamente
    window.location.href = '/my-services?section=appointments';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-cancelled-icon">
          <XCircle size={64} color="#ef4444" />
        </div>
        
        <h2 className="payment-modal-title">Pagamento Cancelado</h2>
        
        <p className="payment-modal-description">
          O processo de pagamento foi cancelado. Nenhuma cobrança foi efetuada.
        </p>
        
        <p className="payment-modal-help">
          Se teve algum problema, pode tentar novamente ou contactar-nos para assistência.
        </p>
        
        <div className="payment-modal-actions">
          <button onClick={handleRetry} className="btn btn-primary">
            Tentar Novamente
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledModal;