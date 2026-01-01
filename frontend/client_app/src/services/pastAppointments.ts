import { getServices } from './ServiceHistoryServices';  // Reutiliza o serviço base
import type { Appointment } from '../interfaces/appointment';

/**
 * Busca e agrupa agendamentos finalizados por mês.
 * @param customerId - ID do cliente.
 * @returns Objeto com agendamentos agrupados por mês (e.g., { 'Outubro 2023': [appointments] }).
 */
export async function getGroupedPastAppointments(customerId: number): Promise<Record<string, Appointment[]>> {
    try {
        const data = await getServices();

        // Filtrar agendamentos do cliente que estejam finalizados ou cancelados
        // IMPORTANTE: Apenas status finais aparecem aqui (Finalized=3, Canceled=5)
        // Appointments ativos (ex: aguardando pagamento) permanecem em Future mesmo com data passada
        const filteredAppointments = data.filter((appointment: Appointment) => {
            const matchCustomer =
                appointment.customer_id === customerId ||
                appointment.customer_id === Number(customerId) ||
                String(appointment.customer_id) === String(customerId);

            const statusId = appointment.status?.id ?? appointment.status_id;
            const statusName = appointment.status?.name?.toLowerCase();

            // Apenas Finalized (id=3) ou Canceled (id=5 ou nome="canceled")
            const isFinalized = statusId === 3 || statusName === 'finalized';
            const isCanceled = statusId === 5 || statusName === 'canceled';

            return matchCustomer && (isFinalized || isCanceled);
        });

        // Agrupar por mês (formato: 'Mês Ano') - mesmo que no futuro
        const grouped: Record<string, Appointment[]> = {};
        filteredAppointments.forEach((appointment) => {
            const date = new Date(appointment.appointment_date);
            const monthYear = date.toLocaleDateString('pt-PT', {
                month: 'long',
                year: 'numeric',
            });

            if (!grouped[monthYear]) {
                grouped[monthYear] = [];
            }
            grouped[monthYear].push(appointment);
        });

        // Ordenar grupos por data decrescente (mais recentes primeiro)
        const sortedGrouped: Record<string, Appointment[]> = {};
        Object.keys(grouped)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .forEach((key) => {
                sortedGrouped[key] = grouped[key].sort(
                    (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
                );
            });

        return sortedGrouped;
    } catch (error) {
        console.error('Erro ao buscar agendamentos finalizados agrupados:', error);
        throw error;
    }
}