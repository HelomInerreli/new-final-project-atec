const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

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