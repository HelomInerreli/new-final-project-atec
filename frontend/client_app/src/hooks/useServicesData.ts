import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type Service } from '../interfaces/service';
import { type Vehicle } from '../interfaces/vehicle';
import { getServices, getCustomerVehicles } from '../services/customerService';

/**
 * Interface para o resultado do hook useServicesData
 */
interface ServicesDataResult {
  /** Indica se os dados estão sendo carregados */
  loading: boolean;
  /** Lista de serviços disponíveis */
  services: Service[];
  /** Lista de veículos do cliente */
  vehicles: Vehicle[];
  /** Mensagem de erro, se houver */
  error: string;
  /** Função para buscar dados */
  fetchData: () => Promise<void>;
  /** Função para refazer a busca */
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar e gerenciar serviços e veículos do cliente
 * @param customerId - ID do cliente (pode ser null se não logado)
 * @returns Objeto com dados, loading, erro e funções de busca
 */
export function useServicesData(customerId: number | null): ServicesDataResult {
  
  /**
     * Tradução de textos
     * @returns Função de tradução
     */
  const { t } = useTranslation();

  /**
     * Estado para indicar se os dados estão sendo carregados
     * Tipo: boolean
     * Inicia como true para indicar que o carregamento está em progresso
  */
  const [loading, setLoading] = useState(false);

  /**
   * Estado para armazenar a lista de serviços
   * Tipo: Service[]
   * Inicia como array vazio
   */
  const [services, setServices] = useState<Service[]>([]);

  /**
   * Estado para armazenar a lista de veículos do cliente
   * Tipo: Vehicle[]
   * Inicia como array vazio
  */
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  /**
   * Estado para armazenar mensagens de erro
   * Tipo: string
   * Inicia como string vazia
   */
  const [error, setError] = useState<string>('');

  /**
   * Função para buscar serviços e veículos
   * Busca serviços sempre, veículos apenas se customerId existir
   */
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
  }, [customerId, t]);

  /**
   * Função para refazer a busca (alias para fetchData)
   */
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