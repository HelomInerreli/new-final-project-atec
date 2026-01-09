import React from 'react';
import { CheckCircle } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  invoiceNumber?: string;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  invoiceNumber,
}) => {
  if (!isOpen) return null;

  const handleViewInvoice = () => {
    window.location.href = `/my-services?section=invoices&appointment=${appointmentId}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-success-icon">
          <CheckCircle size={64} color="#22c55e" />
        </div>
        
        <h2 className="payment-modal-title">Pagamento Confirmado!</h2>
        
        <p className="payment-modal-description">
          O seu pagamento foi processado com sucesso.
        </p>
        
        {invoiceNumber && (
          <div className="payment-invoice-info">
            <span className="label">Número da Fatura:</span>
            <span className="value">{invoiceNumber}</span>
          </div>
        )}
        
        <div className="payment-modal-actions">
          <button onClick={handleViewInvoice} className="btn btn-primary">
            Ver Fatura
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;