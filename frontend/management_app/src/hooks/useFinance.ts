/**
 * Hook personalizado para gerenciar dados financeiros.
 * Permite buscar visão geral, peças e serviços financeiros com filtros de data.
 */

import { useState, useEffect, useCallback } from 'react';
// Importa hooks do React
import { financeService } from '../services/financeService';
// Serviço para finanças
import type { FinanceOverview, PartFinanceItem, ServiceFinanceItem } from '../interfaces/finance';
// Tipos para finanças

/**
 * Hook para gerenciar dados financeiros.
 * @returns Estado e funções para finanças
 */
export function useFinance() {
    // Estado para data inicial
    const [startDate, setStartDate] = useState<Date | null>(null);
    // Estado para data final
    const [endDate, setEndDate] = useState<Date | null>(null);
    // Estado de carregamento
    const [loading, setLoading] = useState<boolean>(false);
    // Estado para visão geral
    const [overview, setOverview] = useState<FinanceOverview | null>(null);
    // Estado para peças
    const [parts, setParts] = useState<PartFinanceItem[]>([]);
    // Estado para serviços
    const [services, setServices] = useState<ServiceFinanceItem[]>([]);

    // Função para formatar data para string
    const formatDateToString = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        return date.toISOString().split('T')[0];
    };

    // Função para buscar dados
    const fetchData = useCallback(async () => {
        // Inicia carregamento
        setLoading(true);
        try {
            // Formata datas
            const startDateStr = formatDateToString(startDate);
            const endDateStr = formatDateToString(endDate);

            // Busca visão geral
            const ovData = await financeService.getOverview(startDateStr, endDateStr);
            setOverview(ovData);

            // Busca peças
            const partsData = await financeService.getPartsFinance(startDateStr, endDateStr);
            setParts(partsData);

            // Busca serviços
            const servicesData = await financeService.getServicesFinance(startDateStr, endDateStr);
            setServices(servicesData);
        } catch (error: any) {
            // Log erro detalhado
            console.error('❌ Error fetching finance data:', {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                fullError: error
            });
        } finally {
            // Finaliza carregamento
            setLoading(false);
        }
    }, [startDate, endDate]);

    // Efeito para buscar dados quando datas mudam
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Função para aplicar filtro
    const handleFilter = () => {
        fetchData();
    };

    // Retorna estado e funções
    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        overview,
        parts,
        services,
        handleFilter,
    };
}