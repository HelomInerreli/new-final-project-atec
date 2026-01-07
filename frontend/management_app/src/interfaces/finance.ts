// Interface para visão geral financeira
export interface FinanceOverview {
    total_revenue: number;
    total_expenses: number;
    total_profit: number;
    total_invoices: number;
}

// Interface para item financeiro de peça
export interface PartFinanceItem {
    part_number: string;
    name: string;
    quantity_sold: number;
    total_cost: number;
    total_revenue: number;
    total_profit: number;
}

// Interface para item financeiro de serviço
export interface ServiceFinanceItem {
    service_id: number;
    service_name: string;
    count: number;
    total_revenue: number;
}

// Interface para dados financeiros
export interface FinanceData {
    overview: FinanceOverview;
    parts: PartFinanceItem[];
    services: ServiceFinanceItem[];
}