import React from 'react';
import { CheckCircle, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewInvoice = () => {
    onClose();
    // Navegar para a página de faturas com o ID do appointment
    setTimeout(() => {
      navigate('/invoices', { state: { appointmentId } });
    }, 200);
  };

  const handleViewAppointments = () => {
    onClose();
    // Navegar para a página de agendamentos futuros
    setTimeout(() => {
      navigate('/future-appointments');
    }, 200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
          <X size={24} />
        </button>

        <div className="payment-success-icon">
          <CheckCircle size={64} color="#22c55e" />
        </div>
        
        <h2 className="payment-modal-title">Pagamento Confirmado!</h2>
        
        <p className="payment-modal-description">
          O seu pagamento foi processado com sucesso. 
          {invoiceNumber && ' A fatura foi gerada automaticamente.'}
        </p>
        
        {invoiceNumber && (
          <div className="payment-invoice-info">
            <FileText size={20} color="#6b7280" />
            <div>
              <span className="label">Número da Fatura</span>
              <span className="value">{invoiceNumber}</span>
            </div>
          </div>
        )}
        
        <div className="payment-modal-actions">
          {invoiceNumber ? (
            <>
              <button onClick={handleViewInvoice} className="btn btn-primary">
                <FileText size={18} />
                Ver Fatura
              </button>
              <button onClick={handleViewAppointments} className="btn btn-secondary">
                Meus Agendamentos
              </button>
            </>
          ) : (
            <>
              <button onClick={handleViewAppointments} className="btn btn-primary">
                Ver Agendamentos
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Fechar
              </button>
            </>
          )}
        </div>
        
        <p className="payment-modal-footer">
          Receberá um email de confirmação em breve.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;