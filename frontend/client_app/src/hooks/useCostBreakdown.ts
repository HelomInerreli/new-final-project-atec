import { useState, useEffect } from 'react';
import { getCostBreakdown } from '../services/costBreakdownService';
import type { CostBreakdown } from '../interfaces/costBreakdown';

/**
 * Hook para buscar e gerenciar o breakdown discriminado de custos
 * @param appointmentId - ID da ordem de serviço (null para não buscar)
 * @returns Objeto com breakdown, loading e error
 */
export function useCostBreakdown(appointmentId: number | null) {
    const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appointmentId) {
            setBreakdown(null);
            return;
        }

        const fetchBreakdown = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getCostBreakdown(appointmentId);
                setBreakdown(data);
            } catch (err) {
                console.error('Erro ao carregar breakdown:', err);
                setError('Não foi possível carregar os detalhes de custos');
                setBreakdown(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBreakdown();
    }, [appointmentId]);

    return { breakdown, loading, error };
}
