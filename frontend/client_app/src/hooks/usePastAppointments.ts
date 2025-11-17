import { useEffect, useState } from 'react';
import type { Appointment } from '../interfaces/appointment';
import { useAuth } from '../api/auth';
import { useTranslation } from 'react-i18next';
import { getGroupedPastAppointments } from '../services/pastAppointments';  // Novo serviço

export function usePastAppointments() {
    const { t } = useTranslation();
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    const [groupedAppointments, setGroupedAppointments] = useState<Record<string, Appointment[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!isLoggedIn || !loggedInCustomerId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const grouped = await getGroupedPastAppointments(loggedInCustomerId);  // Chamada para o novo serviço
                setGroupedAppointments(grouped);
                setError(null);
            } catch (err: any) {
                setError(t('errorLoadingServices'));  // Reutiliza tradução existente
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