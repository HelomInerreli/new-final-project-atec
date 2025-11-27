import { useState, useEffect } from 'react';
import type { Invoice } from '../interfaces/invoice';
import { getInvoiceByAppointment } from '../services/invoiceService';

/**
 * Hook para buscar e gerenciar uma fatura associada a um agendamento
 * @param appointmentId - ID opcional do agendamento para buscar a fatura
 * @returns Objeto com fatura, estado de loading e erro
 */
export function useInvoice(appointmentId?: number) {
    /**
     * Estado invoice - armazena a fatura buscada
     * Tipo Invoice ou null se não houver fatura
     */
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    /**
     * Estado loading - indica se a fatura está sendo carregada
     * Tipo booleano, true enquanto carrega, false quando termina
     */
    const [loading, setLoading] = useState(true);
    /**
     * Estado para armazenar mensagens de erro
     * Tipo: string | null
     * Inicia como null (sem erro)
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Efeito para buscar fatura quando appointmentId muda
     */
    useEffect(() => {
        /**
         * Verifica se appointmentId existe
         */
        if (!appointmentId) {
            setLoading(false);
            return;
        }

        /**
         * Função assíncrona para buscar fatura
         */
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