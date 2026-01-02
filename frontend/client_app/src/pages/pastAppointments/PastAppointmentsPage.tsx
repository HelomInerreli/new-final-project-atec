import { PastAppointments } from '../../components/PastAppointments';

/**
 * Componente de página wrapper para agendamentos passados
 * Renderiza o componente PastAppointments que contém toda a lógica de visualização
 * Serve como página de rota para histórico de agendamentos concluídos
 * @returns Componente JSX da página de agendamentos passados
 */
export function PastAppointmentsPage() {
    return (
        <div>
            <PastAppointments />
        </div>
    );
}
