export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    appointmentId: number;
    appointmentDate: string;
    dueDate: string | null;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string | null;
    vehicle: string | null;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    paymentMethod: string;
    stripePaymentIntentId: string | null;
    notes: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}