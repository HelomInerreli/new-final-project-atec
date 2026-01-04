import type { Appointment } from './appointment';
import type { Vehicle } from './vehicle';

/**
 * Interface para as estatísticas do dashboard
 */
export interface DashboardStats {
    /**
     * Número total de veículos registrados
     */
    totalVehicles: number;
    
    /**
     * Número de agendamentos futuros pendentes
     */
    futureAppointments: number;
    
    /**
     * Número total de serviços/agendamentos concluídos
     */
    pastAppointments: number;
    
    /**
     * Próximo agendamento agendado (ou null se não houver)
     */
    nextAppointment: Appointment | null;
    
    /**
     * Lista dos 5 agendamentos mais recentes concluídos
     */
    recentAppointments: Appointment[];
}

/**
 * Interface para os dados completos do dashboard
 */
export interface DashboardData {
    /**
     * Estatísticas calculadas
     */
    stats: DashboardStats;
    
    /**
     * Lista de veículos do cliente
     */
    vehicles: Vehicle[];
}

/**
 * Interface para o retorno do hook useDashboard
 */
export interface UseDashboardReturn {
    /**
     * Estatísticas do dashboard
     */
    stats: DashboardStats;
    
    /**
     * Lista de veículos
     */
    vehicles: Vehicle[];
    
    /**
     * Estado de carregamento
     */
    loading: boolean;
    
    /**
     * Mensagem de erro (se houver)
     */
    error: string | null;
    
    /**
     * Status de login do usuário
     */
    isLoggedIn: boolean;
    
    /**
     * Função para recarregar os dados
     */
    refreshData: () => Promise<void>;
}
