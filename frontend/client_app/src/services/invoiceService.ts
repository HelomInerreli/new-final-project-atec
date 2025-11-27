const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

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