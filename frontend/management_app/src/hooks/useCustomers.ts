import { useState, useEffect } from 'react';
import type { CustomerDetails } from '../interfaces/Customer'; // <-- Add 'type' here
import http from '../api/http'; // Assuming you have a shared axios instance

export function useFetchCustomers() {
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCustomers = async () => {
      setLoading(true);
      try {
        // This endpoint should return a list of all customers
        const response = await http.get('/customers'); 
        setCustomers(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError('Could not load customer data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCustomers();
  }, []); // The empty array means this effect runs only once

  return { customers, loading, error };
}