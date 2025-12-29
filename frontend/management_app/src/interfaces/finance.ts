export interface FinanceOverview {
    total_revenue: number;
    total_expenses: number;
    total_profit: number;
    total_invoices: number;
}

export interface PartFinanceItem {
    part_number: string;
    name: string;
    quantity_sold: number;
    total_cost: number;
    total_revenue: number;
    total_profit: number;
}

export interface ServiceFinanceItem {
    service_id: number;
    service_name: string;
    count: number;
    total_revenue: number;
}

export interface FinanceData {
    overview: FinanceOverview;
    parts: PartFinanceItem[];
    services: ServiceFinanceItem[];
}