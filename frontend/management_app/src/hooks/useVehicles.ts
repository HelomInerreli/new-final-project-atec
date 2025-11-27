import { useState, useEffect } from 'react';
import http from '../api/http';

interface VehicleCountMap {
  [customerId: string]: number;
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
