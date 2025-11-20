import { useState, useEffect } from 'react';
import type { CompleteCustomerProfile } from '../interfaces/Customer';
import http from '../api/http';

export function useFetchCustomers() {
  const [customers, setCustomers] = useState<CompleteCustomerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCustomers = async () => {
      console.log('=== Starting customer fetch ===');
      setLoading(true);
      try {
        console.log('Fetching customers from /customers/all-profiles');
        const response = await http.get('/customers/all-profiles');
        console.log('Raw response:', response);
        console.log('Response data:', response.data);
        console.log('Response data length:', response.data?.length);
        
        setCustomers(response.data);
        console.log('Customers set in state:', response.data);
        setError(null);
      } catch (err: any) {
        console.error("=== Error occurred ===");
        console.error("Failed to fetch customers:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        setError(err.response?.data?.detail || 'Could not load customer data. Please try again.');
      } finally {
        setLoading(false);
        console.log('=== Fetch complete, loading set to false ===');
      }
    };

    fetchAllCustomers();
  }, []);

  console.log('Hook returning:', { customersLength: customers.length, loading, error });

  return { customers, loading, error };
}