import { useState, useEffect } from 'react';
import http from '../api/http';
import type { CompleteCustomerProfile } from '../interfaces/Customer';

interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  deleted_at: string | null;
}

interface CustomerDetailsData {
  auth: {
    id: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    birth_date: string | null;
    created_at: string;
    updated_at: string;
  };
  vehicles: Vehicle[];
}

export function useFetchCustomerById(customerId: string | undefined) {
  const [customerData, setCustomerData] = useState<CustomerDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setError('No customer ID provided');
      return;
    }
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        // Fetch customer auth info from all-profiles (we'll filter it)
        const allProfilesResponse = await http.get('/customers/all-profiles');
        // Fetch customer's vehicles
        const vehiclesResponse = await http.get(`/vehicles/by_customer/${customerId}`);
        const customerProfile = allProfilesResponse.data.find(
          (profile: CompleteCustomerProfile) => profile.customer.id === parseInt(customerId)
        );

        if (!customerProfile) {
          throw new Error('Customer profile not found');
        }
        const data: CustomerDetailsData = {
          auth: customerProfile.auth,
          customer: customerProfile.customer,
          vehicles: vehiclesResponse.data || []
        };

        setCustomerData(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Could not load customer details.');
        setCustomerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const updateCustomer = async (updatedData: any) => {
    if (!customerId) return;
    try {
      const response = await http.put(`/customers/${customerId}`, updatedData);
      
      setCustomerData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          auth: {
            ...prev.auth,
            email: updatedData.email || prev.auth.email
          },
          customer: {
            ...prev.customer,
            ...response.data
          }
        };
      });
      return response.data;
    } catch (err: any) {
      console.error('Failed to update customer:', err);
      throw err;
    }
  };

  return { customerData, loading, error, updateCustomer };
}
