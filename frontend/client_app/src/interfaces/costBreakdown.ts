/**
 * Interface para representar uma peça numa fatura/orçamento
 */
export interface PartLineItem {
    name: string;
    part_number: string | null;
    quantity: number;
    unit_price: number;
    total: number;
}

/**
 * Interface para o breakdown de um serviço (base ou extra)
 */
export interface ServiceBreakdown {
    name: string;
    labor_cost: number;
    parts: PartLineItem[];
    subtotal: number;
}

/**
 * Interface para o breakdown completo de custos de uma ordem de serviço
 * Discrimina mão de obra e peças do serviço base e dos serviços extras
 */
export interface CostBreakdown {
    base_service: ServiceBreakdown;
    extra_services: ServiceBreakdown[];
    total: number;
}
