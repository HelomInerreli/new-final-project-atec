import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';
import type { Vehicle } from '../interfaces/Vehicle';

interface VehicleCountMap {
  [customerId: string]: number;
}

export interface VehicleWithCustomer extends Vehicle {
  customer_name?: string;
}

export function useFetchVehicleCounts(customerIds: number[]) {
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCountMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerIds.length === 0) {
      setVehicleCounts({});
      return;
    }

    const fetchVehicleCounts = async () => {
      setLoading(true);
      try {
        const counts: VehicleCountMap = {};
        // Fetch vehicle count for each customer
        await Promise.all(
          customerIds.map(async (customerId) => {
            try {
              const response = await http.get(`/vehicles/by_customer/${customerId}`);
              counts[customerId.toString()] = response.data?.length || 0;
            } catch (err) {
              counts[customerId.toString()] = 0;
            }
          })
        );
        setVehicleCounts(counts);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Could not load vehicle counts.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleCounts();
  }, [customerIds.join(',')]); // Re-run when customer IDs change
  return { vehicleCounts, loading, error };
}

export function useFetchVehicles() {
  const [vehicles, setVehicles] = useState<VehicleWithCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetch function that can be called manually
  const fetchAllVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await http.get('/vehicles/');
      // Fetch customer names for each vehicle
      const vehiclesWithCustomers = await Promise.all(
        response.data.map(async (vehicle: Vehicle) => {
          try {
            const customerResponse = await http.get(`/customers/${vehicle.customer_id}`);
            return {
              ...vehicle,
              customer_name: customerResponse.data.name || 'Unknown',
            };
          } catch {
            return {
              ...vehicle,
              customer_name: 'Unknown',
            };
          }
        })
      );
      setVehicles(vehiclesWithCustomers);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not load vehicle data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  // Expose a refetch function for callers
  return { vehicles, loading, error, refetch: fetchAllVehicles };
}
