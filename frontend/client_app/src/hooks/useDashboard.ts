import { useEffect, useState } from 'react';
import { useAuth } from '../api/auth';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats, UseDashboardReturn } from '../interfaces/dashboard';
import type { Vehicle } from '../interfaces/vehicle';

/**
 * Hook para gerenciar os dados do dashboard do cliente
 * Busca veículos, agendamentos futuros e passados usando o dashboardService
 * @returns Objeto com estatísticas, estados de loading/erro e status de login
 */
export function useDashboard(): UseDashboardReturn {
    const { t } = useTranslation();
    const { loggedInCustomerId, isLoggedIn } = useAuth();

    /**
     * Estado para armazenar as estatísticas do dashboard
     */
    const [stats, setStats] = useState<DashboardStats>({
        totalVehicles: 0,
        futureAppointments: 0,
        pastAppointments: 0,
        nextAppointment: null,
        recentAppointments: [],
    });

    /**
     * Estado para veículos do cliente
     */
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    /**
     * Estado para indicar carregamento de dados
     */
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Estado para mensagens de erro
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Função para buscar todos os dados do dashboard
     */
    const fetchDashboardData = async () => {
        if (!loggedInCustomerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Buscar dados usando o service dedicado
            const dashboardData = await dashboardService.getDashboardData(loggedInCustomerId);

            // Atualizar estados
            setStats(dashboardData.stats);
            setVehicles(dashboardData.vehicles);
        } catch (err) {
            console.error('Erro ao buscar dados do dashboard:', err);
            setError(t('dashboard.errorLoading', { defaultValue: 'Erro ao carregar dados do dashboard' }));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Efeito para buscar dados quando o usuário está logado
     */
    useEffect(() => {
        if (isLoggedIn && loggedInCustomerId) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [loggedInCustomerId, isLoggedIn]);

    return {
        stats,
        vehicles,
        loading,
        error,
        isLoggedIn,
        refreshData: fetchDashboardData,
    };
}
