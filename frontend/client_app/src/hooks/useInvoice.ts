import { useState, useEffect } from 'react';
import type { Invoice } from '../interfaces/invoice';
import { getInvoiceByAppointment } from '../services/invoiceService';

export function useInvoice(appointmentId?: number) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appointmentId) {
            setLoading(false);
            return;
        }

        const fetchInvoice = async () => {
            try {
                setLoading(true);
                const data = await getInvoiceByAppointment(appointmentId);
                setInvoice(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching invoice:', err);
                setError(err.message || 'Erro ao carregar fatura');
                setInvoice(null);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [appointmentId]);

    return { invoice, loading, error };
}