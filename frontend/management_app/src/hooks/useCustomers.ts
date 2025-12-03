import { useState, useEffect, useCallback } from 'react';
import type { CompleteCustomerProfile } from '../interfaces/Customer';
import http from '../api/http';

export function useFetchCustomers() {
  const [customers, setCustomers] = useState<CompleteCustomerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetch function that can be called manually
  const fetchAllCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await http.get('/customers/all-profiles');
      setCustomers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not load customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Expose a refetch function for callers
  return { customers, loading, error, refetch: fetchAllCustomers };
}