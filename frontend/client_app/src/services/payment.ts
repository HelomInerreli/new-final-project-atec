/**
 * URL base da API para requisições de pagamento
 * Obtém de variáveis de ambiente (VITE_API_BASE_URL ou VITE_API_URL)
 * Remove trailing slash e usa fallback para localhost:8000/api/v1
 */
const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

/**
 * Cria uma sessão de checkout Stripe para pagamento de agendamento
 * Envia requisição POST com ID do agendamento e retorna URL da sessão de pagamento
 * Utiliza autenticação via token do localStorage e inclui credentials para cookies
 * @param appointmentId - ID numérico do agendamento a ser pago
 * @returns Promise com string contendo URL da sessão de checkout Stripe
 * @throws Error com mensagem 'Failed to create checkout session' se requisição falhar
 * @throws Error com mensagem 'Checkout session URL missing' se resposta não incluir URL
 */
export async function createAppointmentCheckoutSession(appointmentId: number): Promise<string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ appointment_id: appointmentId }),
    });

    if (!response.ok) {
        throw new Error('Failed to create checkout session');
    }

    const data = await response.json();

    if (!data?.url) {
        throw new Error('Checkout session URL missing');
    }

    return data.url;
}