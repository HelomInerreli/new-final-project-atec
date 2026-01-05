import { useState, useEffect } from 'react';
import type { Appointment } from '../interfaces/Appointment';

export const useFetchAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/appointments/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const data = await response.json();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return { appointments, loading, error };
};

export const useFetchCustomerAppointments = (customerId: string | null) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setAppointments([]);
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/appointments/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const data: Appointment[] = await response.json();
        
        // Filter appointments by customer_id
        const customerAppointments = data.filter(
          (appointment) => appointment.customer_id.toString() === customerId
        );
        
        setAppointments(customerAppointments);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [customerId]);

  return { appointments, loading, error };
};
