/**
 * Tipo para estados possíveis de uma fatura
 * - paid: paga/liquidada
 * - pending: pendente de pagamento
 * - overdue: atrasada/vencida
 */
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

/**
 * Interface para representar uma peça numa fatura
 */
export interface InvoicePartItem {
    name: string;
    part_number: string | null;
    quantity: number;
    unit_price: number;
    total: number;
}

/**
 * Interface para o breakdown de um serviço na fatura
 */
export interface InvoiceServiceBreakdown {
    name: string;
    labor_cost: number;
    parts: InvoicePartItem[];
    subtotal: number;
}

/**
 * Interface para representação de um item/linha individual da fatura
 * Cada item representa um serviço ou produto cobrado com quantidade e preços
 */
export interface InvoiceItem {
    /** Descrição do item/serviço */
    description: string;
    /** Quantidade do item */
    quantity: number;
    /** Preço unitário do item */
    unitPrice: number;
    /** Valor total do item (quantity * unitPrice) */
    total: number;
}

/**
 * Interface principal para representação completa de uma fatura
 * Contém todos os dados necessários para exibir e processar uma fatura
 * Inclui informações do cliente, agendamento, itens cobrados e dados de pagamento
 */
export interface Invoice {
    /** ID único da fatura */
    id: number;
    /** Número identificador da fatura (formato de exibição) */
    invoiceNumber: string;
    /** ID do agendamento associado a esta fatura */
    appointmentId: number;
    /** Data do agendamento no formato ISO */
    appointmentDate: string;
    /** Data de vencimento da fatura (null se não definida) */
    dueDate: string | null;
    /** Nome completo do cliente */
    clientName: string;
    /** Email de contacto do cliente */
    clientEmail: string;
    /** Telefone de contacto do cliente */
    clientPhone: string;
    /** Morada do cliente (null se não fornecida) */
    clientAddress: string | null;
    /** Veículo associado (marca modelo matrícula) */
    vehicle: string | null;
    /** Array de itens/serviços cobrados nesta fatura */
    items: InvoiceItem[];
    /** Breakdown discriminado de custos (mão de obra + peças) */
    breakdown?: {
        base_service: InvoiceServiceBreakdown;
        extra_services: InvoiceServiceBreakdown[];
        total: number;
    };
    /** Subtotal dos itens antes de impostos */
    subtotal: number;
    /** Valor do imposto/IVA aplicado */
    tax: number;
    /** Valor total final da fatura (subtotal + tax) */
    total: number;
    /** Status atual da fatura (paid, pending, overdue) */
    status: string;
    /** Método de pagamento utilizado ou selecionado */
    paymentMethod: string;
    /** ID da intenção de pagamento Stripe (null se pagamento não via Stripe) */
    stripePaymentIntentId: string | null;
    /** Notas ou observações adicionais sobre a fatura (null se não existem) */
    notes: string | null;
    /** Data de criação da fatura no formato ISO (null se não disponível) */
    createdAt: string | null;
    /** Data da última atualização da fatura no formato ISO (null se não disponível) */
    updatedAt: string | null;
}