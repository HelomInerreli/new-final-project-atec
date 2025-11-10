import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceDetail } from '../../components/InvoiceDetail';

export function InvoiceDetailPage() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/client/invoices');
    };

    if (!appointmentId) {
        return (
            <div className="alert alert-warning">
                ID do appointment não encontrado
            </div>
        );
    }

    return (
        <div className="future-appointments-page">
            <button 
                className="btn btn-secondary mb-3"
                onClick={handleBack}
            >
                ← Voltar às faturas
            </button>
            <InvoiceDetail appointmentId={parseInt(appointmentId)} />
        </div>
    );
}