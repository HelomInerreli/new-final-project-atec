import { getServices } from './ServiceHistoryServices';
import type { Appointment } from '../interfaces/appointment';

/**
 * Busca e agrupa agendamentos finalizados de um cliente por mês
 * Filtra apenas agendamentos com status "Finalizado" (id = 3)
 * Agrupa por mês no formato "mês ano" (ex: "outubro 2023")
 * Ordena grupos cronologicamente decrescente (mais recentes primeiro) e agendamentos dentro de cada grupo por data decrescente
 * @param customerId - ID numérico do cliente
 * @returns Promise com objeto Record de agendamentos agrupados por mês (chave: "mês ano", valor: array de Appointment)
 * @throws Erro se falhar a busca de agendamentos na API
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