import http from '../api/http';
import type {
    FinanceOverview,
    PartFinanceItem,
    ServiceFinanceItem,
} from '../interfaces/finance';

// Serviço para gerenciar finanças
export const financeService = {
    // Visão geral financeira
    getOverview: async (startDate?: string, endDate?: string): Promise<FinanceOverview> => {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await http.get<FinanceOverview>(
            `/finance/overview`,
            { params }
        );
        return response.data;
    },

    // Financeiro de peças
    getPartsFinance: async (
        startDate?: string,
        endDate?: string
    ): Promise<PartFinanceItem[]> => {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await http.get<PartFinanceItem[]>(
            `/finance/parts`,
            { params }
        );
        return response.data;
    },

    // Financeiro de serviços
    getServicesFinance: async (
        startDate?: string,
        endDate?: string
    ): Promise<ServiceFinanceItem[]> => {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await http.get<ServiceFinanceItem[]>(
            `/finance/services`,
            { params }
        );
        return response.data;
    },
};