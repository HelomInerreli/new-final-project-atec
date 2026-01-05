import { useState, useEffect, useCallback } from 'react';
import { financeService } from '../services/financeService';
import type { FinanceOverview, PartFinanceItem, ServiceFinanceItem } from '../interfaces/finance';

export function useFinance() {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [overview, setOverview] = useState<FinanceOverview | null>(null);
    const [parts, setParts] = useState<PartFinanceItem[]>([]);
    const [services, setServices] = useState<ServiceFinanceItem[]>([]);

    const formatDateToString = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        return date.toISOString().split('T')[0];
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const startDateStr = formatDateToString(startDate);
            const endDateStr = formatDateToString(endDate);
            
            const ovData = await financeService.getOverview(startDateStr, endDateStr);
            setOverview(ovData);
            
            const partsData = await financeService.getPartsFinance(startDateStr, endDateStr);
            setParts(partsData);
            
            const servicesData = await financeService.getServicesFinance(startDateStr, endDateStr);
            setServices(servicesData);
        } catch (error: any) {
            console.error('❌ Error fetching finance data:', {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                fullError: error
            });
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilter = () => {
        fetchData();
    };

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