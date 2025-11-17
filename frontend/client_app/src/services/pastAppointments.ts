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

        // Filtrar agendamentos do cliente e status finalizado (id === 3)
        const filteredAppointments = data.filter((appointment: Appointment) => {
            const matchStatus = appointment.status?.id === 3;  // Mudança: status finalizado
            const matchCustomer =
                appointment.customer_id === customerId ||
                appointment.customer_id === Number(customerId) ||
                String(appointment.customer_id) === String(customerId);

            return matchStatus && matchCustomer;
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