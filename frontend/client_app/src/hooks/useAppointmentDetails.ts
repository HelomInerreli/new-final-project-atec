import { useState, useEffect } from 'react';
import type { Appointment } from '../interfaces/appointment';
import { fetchAppointmentById } from '../services/appointmentDetails';

export function useAppointmentDetails(id: number | null) {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchAppointmentById(id)
            .then(setAppointment)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    return { appointment, loading, error };
}