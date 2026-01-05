import { getServices } from './ServiceHistoryServices';
import type { Appointment } from '../interfaces/appointment';

/**
 * Busca e agrupa agendamentos futuros de um cliente por mês
 * Filtra apenas agendamentos com status "Pendente" (1) ou "Waitting Payment" (6)
 * Agrupa por mês no formato "mês ano" (ex: "outubro 2023")
 * Ordena grupos cronologicamente (mais próximos primeiro) e agendamentos dentro de cada grupo por data
 * @param customerId - ID numérico do cliente
 * @returns Promise com objeto Record de agendamentos agrupados por mês (chave: "mês ano", valor: array de Appointment)
 * @throws Erro se falhar a busca de agendamentos na API
 */
export async function getGroupedAppointments(customerId: number): Promise<Record<string, Appointment[]>> {
    try {
        const data = await getServices();

        // Status permitidos: Pendente, In Repair, Awaiting Approval, Waitting Payment
        // Excluir apenas: Finalized e Canceled
        const allowedStatusIds = new Set([1, 2, 4, 6]); // 1=Pendente, 2=Awaiting Approval, 4=In Repair, 6=Waitting Payment
        const allowedStatusNames = new Set(['pendente', 'awaiting approval', 'in repair', 'waitting payment']);

        // Filtrar agendamentos do cliente com status ativo
        // IMPORTANTE: Appointments com status ativo aparecem aqui INDEPENDENTE da data
        // (ex: aguardando pagamento deve aparecer mesmo se a data já passou)
        const filteredAppointments = data.filter((appointment: Appointment) => {
            const statusId = appointment.status?.id ?? appointment.status_id;
            const statusName = appointment.status?.name?.toLowerCase();

            const matchCustomer = appointment.customer_id === customerId;
            const matchStatus =
                (typeof statusId === 'number' && allowedStatusIds.has(statusId)) ||
                (statusName && allowedStatusNames.has(statusName));

            // Appointments com status ativo aparecem aqui, independente da data
            return matchCustomer && matchStatus;
        });

        // Agrupar por mês (formato: 'Mês Ano')
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

        // Ordenar grupos por data crescente (mais próximo primeiro)
        const sortedGrouped: Record<string, Appointment[]> = {};

        const entries = Object.entries(grouped);

        entries.sort(([, appsA], [, appsB]) => {
            const dateA = appsA[0] ? new Date(appsA[0].appointment_date).getTime() : 0;
            const dateB = appsB[0] ? new Date(appsB[0].appointment_date).getTime() : 0;
            return dateA - dateB;
        });

        entries.forEach(([key, apps]) => {
            sortedGrouped[key] = apps.sort(
                (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
            );
        });

        return sortedGrouped;
    } catch (error) {
        console.error('Erro ao buscar agendamentos agrupados:', error);
        throw error;
    }
}