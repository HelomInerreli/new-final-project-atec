import { useEffect, useState } from 'react';
import type { Appointment } from '../interfaces/appointment';
import { useAuth } from '../api/auth';
import { useTranslation } from 'react-i18next';
import { getGroupedPastAppointments } from '../services/pastAppointments';

/**
 * Hook para buscar e gerenciar agendamentos passados agrupados por data
 * @returns Objeto com agendamentos agrupados, estado de loading, erro e status de login
 */
export function usePastAppointments() {

    /**
     * Tradução de textos
     * @returns Função de tradução
     */
    const { t } = useTranslation();

    /**
     * Hooks e estados necessários
     * loggedInCustomerId - ID do cliente logado
     * isLoggedIn - Status de login do usuário (boolean)
     */
    const { loggedInCustomerId, isLoggedIn } = useAuth();

    /**
     * Estado para armazenar agendamentos futuros agrupados por data
     * Formato: { "YYYY-MM-DD": Appointment[] }
     * Hash map onde a chave é a data e o valor é um array de agendamentos
     */
    const [groupedAppointments, setGroupedAppointments] = useState<Record<string, Appointment[]>>({});

    /**
     * Estado para indicar se os dados estão sendo carregados
     * Tipo: boolean
     * Inicia como true para indicar que o carregamento está em progresso
     */
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Estado para armazenar mensagens de erro
     * Tipo: string | null
     * Inicia como null (sem erro)
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Efeito para buscar agendamentos quando o usuário está logado
     */
    useEffect(() => {
        /**
         * Função assíncrona para buscar agendamentos passados
         */
        const fetchAppointments = async () => {
            if (!isLoggedIn || !loggedInCustomerId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const grouped = await getGroupedPastAppointments(loggedInCustomerId);
                setGroupedAppointments(grouped);
                setError(null);
            } catch (err: any) {
                setError(t('errorLoadingServices'));
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [isLoggedIn, loggedInCustomerId, t]);

    return {
        groupedAppointments,
        loading,
        error,
        isLoggedIn,
    };
}