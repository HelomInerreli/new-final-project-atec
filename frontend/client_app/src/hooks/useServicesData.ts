import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type Service } from '../interfaces/service';
import { type Vehicle } from '../interfaces/vehicle';
import { getServices, getCustomerVehicles } from '../services/customerService';

interface ServicesDataResult {
  loading: boolean;
  services: Service[];
  vehicles: Vehicle[];
  error: string;
  fetchData: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useServicesData(customerId: number | null): ServicesDataResult {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string>('');

  // ✅ FIX: useCallback com dependências corretas
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const servicesData = await getServices();
      setServices(servicesData);

      if (customerId) {
        const vehiclesData = await getCustomerVehicles(customerId);
        setVehicles(vehiclesData);
      } else {
        setVehicles([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(
        t('errorLoadingServices', { 
          defaultValue: `Erro ao carregar dados: ${errorMessage}` 
        })
      );
      console.error('Error fetching services/vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId, t]); // ✅ Apenas customerId e t como dependências

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return {
    loading,
    services,
    vehicles,
    error,
    fetchData,
    refetch,
  };
}