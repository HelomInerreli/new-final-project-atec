/**
 * URL base da API para requisições de fatura
 * Obtém de variáveis de ambiente (VITE_API_BASE_URL ou VITE_API_URL)
 * Remove trailing slash e usa fallback para localhost:8000/api/v1
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

/**
 * Busca fatura associada a um agendamento específico
 * Utiliza fetch nativo com token de autenticação do localStorage
 * Inclui credentials para suportar cookies/sessões
 * @param appointmentId - ID numérico do agendamento
 * @returns Promise com dados da fatura em formato JSON
 * @throws Error com mensagem 'Failed to fetch invoice' se requisição falhar (status não-OK)
 */
export async function getInvoiceByAppointment(appointmentId: number) {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/payments/invoices/${appointmentId}`, {
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch invoice');
    }

    return await response.json();
}