import { useParams } from 'react-router-dom';
import { useAppointmentDetails } from '../hooks/useAppointmentDetails';

export function AppointmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { appointment, loading, error } = useAppointmentDetails(id ? Number(id) : null);

    if (loading) return <div className="container mt-5">Carregando...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">Erro: {error}</div>;
    if (!appointment) return <div className="container mt-5 alert alert-warning">Agendamento não encontrado</div>;

    return (
        <div className="container mt-5">
            <h1>Detalhes do Agendamento</h1>
            <p><strong>ID:</strong> {appointment.id}</p>
            <p><strong>Data:</strong> {appointment.appointment_date || appointment.date}</p>
            <p><strong>Descrição:</strong> {appointment.description || 'N/A'}</p>
            <p><strong>Orçamento Estimado:</strong> €{appointment.estimated_budget?.toFixed(2) || 'N/A'}</p>
            <p><strong>Orçamento Atual:</strong> €{appointment.actual_budget?.toFixed(2) || 'N/A'}</p>
            <p><strong>Serviço:</strong> {appointment.service?.name || 'N/A'}</p>
            <p><strong>Veículo:</strong> {appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}` : 'N/A'}</p>
            <p><strong>Status:</strong> {appointment.status?.name || 'N/A'}</p>
            {/* Adicione mais campos se necessário */}
        </div>
    );
}