import { vehicleService } from './vehicleServices';
import { getGroupedAppointments } from './futureAppointments';
import { getGroupedPastAppointments } from './pastAppointments';
import type { Appointment } from '../interfaces/appointment';
import type { Vehicle } from '../interfaces/vehicle';
import type { DashboardData, DashboardStats } from '../interfaces/dashboard';

/**
 * Service para gerenciar operações relacionadas ao dashboard
 * Centraliza a lógica de busca e processamento de dados
 */
export const dashboardService = {
    /**
     * Busca todos os dados necessários para o dashboard de um cliente
     * 
     * @param customerId - ID do cliente logado
     * @returns Objeto com estatísticas calculadas e lista de veículos
     * @throws Error se houver falha ao buscar os dados
     */
    async getDashboardData(customerId: number): Promise<DashboardData> {
        try {
            // Buscar dados em paralelo para otimizar performance
            const [vehiclesData, futureAppointmentsData, pastAppointmentsData] = await Promise.all([
                vehicleService.getByCustomer(customerId),
                getGroupedAppointments(customerId),
                getGroupedPastAppointments(customerId),
            ]);

            // Processar estatísticas
            const stats = this.processStats(
                vehiclesData,
                futureAppointmentsData,
                pastAppointmentsData
            );

            return {
                stats,
                vehicles: vehiclesData,
            };
        } catch (error: any) {
            console.error('Erro ao buscar dados do dashboard:', error);
            throw new Error(
                `Falha ao carregar dados do dashboard: ${error.message || 'Erro desconhecido'}`
            );
        }
    },

    /**
     * Processa os dados brutos e calcula as estatísticas do dashboard
     * 
     * @param vehicles - Lista de veículos do cliente
     * @param futureAppointmentsData - Agendamentos futuros agrupados por data
     * @param pastAppointmentsData - Agendamentos passados agrupados por data
     * @returns Objeto DashboardStats com estatísticas calculadas
     */
    processStats(
        vehicles: Vehicle[],
        futureAppointmentsData: Record<string, Appointment[]>,
        pastAppointmentsData: Record<string, Appointment[]>
    ): DashboardStats {
        // Processar agendamentos futuros
        const futureAppointmentsList = Object.values(futureAppointmentsData).flat() as Appointment[];
        const sortedFutureAppointments = this.sortAppointmentsByDate(futureAppointmentsList, 'asc');

        // Processar agendamentos passados
        const pastAppointmentsList = Object.values(pastAppointmentsData).flat() as Appointment[];
        const sortedPastAppointments = this.sortAppointmentsByDate(pastAppointmentsList, 'desc');

        // Pegar os 5 agendamentos mais recentes (passados)
        const recentAppointments = sortedPastAppointments.slice(0, 5);

        return {
            totalVehicles: vehicles.length,
            futureAppointments: futureAppointmentsList.length,
            pastAppointments: pastAppointmentsList.length,
            nextAppointment: sortedFutureAppointments[0] || null,
            recentAppointments,
        };
    },

    /**
     * Ordena agendamentos por data
     * 
     * @param appointments - Lista de agendamentos
     * @param order - Ordem de classificação ('asc' para crescente, 'desc' para decrescente)
     * @returns Lista de agendamentos ordenada
     */
    sortAppointmentsByDate(
        appointments: Appointment[],
        order: 'asc' | 'desc' = 'asc'
    ): Appointment[] {
        return appointments.sort((a, b) => {
            const dateA = new Date(a.appointment_date).getTime();
            const dateB = new Date(b.appointment_date).getTime();
            
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    },

    /**
     * Filtra agendamentos por status
     * 
     * @param appointments - Lista de agendamentos
     * @param statusId - ID do status desejado
     * @returns Lista de agendamentos filtrada
     */
    filterByStatus(appointments: Appointment[], statusId: number): Appointment[] {
        return appointments.filter(app => app.status_id === statusId);
    },

    /**
     * Agrupa agendamentos por veículo
     * 
     * @param appointments - Lista de agendamentos
     * @returns Objeto com agendamentos agrupados por ID do veículo
     */
    groupByVehicle(appointments: Appointment[]): Record<number, Appointment[]> {
        return appointments.reduce((acc, appointment) => {
            const vehicleId = appointment.vehicle_id;
            if (!acc[vehicleId]) {
                acc[vehicleId] = [];
            }
            acc[vehicleId].push(appointment);
            return acc;
        }, {} as Record<number, Appointment[]>);
    },
};
