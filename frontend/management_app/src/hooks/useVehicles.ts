/**
 * Hook personalizado para gerenciar página de veículos.
 * Permite buscar, filtrar, paginar, criar, excluir e associar veículos a clientes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
// Importa hooks do React
import http from '../api/http';
// Cliente HTTP
import type { VehicleCreate, VehicleCountMap, VehicleWithCustomer } from '../interfaces/Vehicle';
// Tipos para veículo
import type { VehicleAPI } from '../interfaces/VehicleAPI';
// Tipo para dados da API
import { vehicleService } from '../services/vehicleService';
// Serviço para veículos
import { vehicleService as vehicleAPIService } from '../services/vehicleAPIService';
// Serviço para API de veículos
import { toast } from './use-toast';
// Hook para toasts
import { getErrorMessage } from '../utils/errorHandler';
// Utilitário para mensagens de erro

/**
 * Hook para gerenciar página de veículos.
 * @returns Estado e funções para a página de veículos
 */
export function useVehiclesPage() {
  // Estados de dados
  const [rawVehicles, setRawVehicles] = useState<VehicleWithCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [assignCustomerDialogOpen, setAssignCustomerDialogOpen] = useState(false);
  const [vehicleToAssign, setVehicleToAssign] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  // Tamanho da página
  const pageSize = 6;

  // Função para buscar todos os veículos
  const fetchAllVehicles = useCallback(async () => {
    // Inicia carregamento
    setLoading(true);
    try {
      // Busca veículos
      const response = await http.get('/vehicles/');
      setRawVehicles(response.data);
      setError(null);
    } catch (err) {
      // Define erro
      setError(getErrorMessage(err, 'Could not load vehicle data. Please try again.'));
    } finally {
      // Finaliza carregamento
      setLoading(false);
    }
  }, []);

  // Carregamento inicial
  useEffect(() => {
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  // Mapeia dados do backend
  const vehicles = useMemo(() => {
    return rawVehicles.map(vehicle => ({
      id: vehicle.id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      kilometers: vehicle.kilometers || 0,
      customerName: vehicle.customer_name || 'Sem Cliente',
      customerId: vehicle.customer_id,
      status: (() => {
        if (vehicle.deleted_at != null) return 'Inativo';
        if (vehicle.customer_id == 0) return 'Sem Cliente';
        return 'Ativo';
      })(),
    }));
  }, [rawVehicles]);

  // Reseta página quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFiltro]);

  // Filtra veículos baseado no termo de busca
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFiltro === "todos" || vehicle.status === statusFiltro;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFiltro]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const paginatedVehicles = filteredVehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Handlers
  const handleDelete = (id: string) => {
    setVehicleToDelete(parseInt(id));
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        // Deleta veículo
        await vehicleService.delete(vehicleToDelete);
        // Mostra toast de sucesso
        toast({
          title: 'Veículo eliminado',
          description: 'O veículo foi eliminado com sucesso.',
        });
        // Recarrega dados
        fetchAllVehicles();
      } catch {
        // Mostra toast de erro
        toast({
          title: 'Erro',
          description: 'Não foi possível eliminar o veículo.',
          variant: 'destructive',
        });
      }
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleAssignCustomer = (vehicleId: string) => {
    setVehicleToAssign(vehicleId);
    setAssignCustomerDialogOpen(true);
  };

  const confirmAssignCustomer = async (customerId: number) => {
    if (vehicleToAssign) {
      try {
        // Atualiza veículo com cliente
        await vehicleService.update(parseInt(vehicleToAssign), { customer_id: customerId });
        // Mostra toast de sucesso
        toast({
          title: 'Cliente associado',
          description: 'O cliente foi associado ao veículo com sucesso.',
        });
        // Recarrega dados
        fetchAllVehicles();
      } catch {
        // Mostra toast de erro
        toast({
          title: 'Erro',
          description: 'Não foi possível associar o cliente ao veículo.',
          variant: 'destructive',
        });
      }
    }
    setAssignCustomerDialogOpen(false);
    setVehicleToAssign(null);
  };

  const handleCreateVehicle = async (vehicleData: VehicleCreate) => {
    // Inicia criação
    setCreatingVehicle(true);
    try {
      // Cria veículo
      await vehicleService.create(vehicleData);
      // Mostra toast de sucesso
      toast({ title: 'Veículo Criado', description: 'O novo veículo foi criado com sucesso.' });
      // Fecha modal
      setNewVehicleModalOpen(false);
      // Recarrega dados
      fetchAllVehicles();
    } catch (err) {
      // Mostra toast de erro
      toast({
        title: 'Erro',
        description: getErrorMessage(err, 'Não foi possível criar o veículo.'),
        variant: 'destructive',
      });
    } finally {
      // Finaliza criação
      setCreatingVehicle(false);
    }
  };

  const formatKilometers = (km: number) => {
    return km > 0 ? `${km.toLocaleString('pt-PT')} km` : '0 km';
  };

  const getFromAPI = async (plate: string): Promise<VehicleAPI | null> => {
    try {
      // Busca dados da API
      const vehicleData = await vehicleAPIService.getByPlate(plate);
      // Mostra toast de sucesso
      toast({ 
        title: 'Veículo encontrado', 
        description: `Dados do veículo ${vehicleData.brand} ${vehicleData.model} obtidos da API.` 
      });
      return vehicleData;
    } catch {
      // Mostra toast de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível obter os dados do veículo da API.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Retorna estado e funções
  return {
    // Data
    paginatedVehicles,
    filteredVehicles,
    loading,
    error,
    statusFiltro,

    // UI State
    searchTerm,
    setSearchTerm,
    newVehicleModalOpen,
    setNewVehicleModalOpen,
    creatingVehicle,
    deleteDialogOpen,
    setDeleteDialogOpen,
    assignCustomerDialogOpen,
    setAssignCustomerDialogOpen,
    setStatusFiltro,

    // Pagination
    page,
    setPage,
    totalPages,
    pageSize,

    // Handlers
    handleDelete,
    confirmDelete,
    handleAssignCustomer,
    confirmAssignCustomer,
    handleCreateVehicle,
    formatKilometers,
    getFromAPI,
  };
}

/**
 * Hook para buscar contagem de veículos por cliente.
 * @param customerIds - IDs dos clientes
 * @returns Contagem de veículos, carregamento e erro
 */
export function useFetchVehicleCounts(customerIds: number[]) {
  // Estado para contagem de veículos
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCountMap>({});
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar contagens quando IDs mudam
  useEffect(() => {
    if (customerIds.length === 0) {
      setVehicleCounts({});
      return;
    }

    // Função para buscar contagens
    const fetchVehicleCounts = async () => {
      // Inicia carregamento
      setLoading(true);
      try {
        const counts: VehicleCountMap = {};
        // Busca contagem para cada cliente
        await Promise.all(
          customerIds.map(async (customerId) => {
            try {
              const response = await http.get(`/vehicles/by_customer/${customerId}`);
              counts[customerId.toString()] = response.data?.length || 0;
            } catch {
              counts[customerId.toString()] = 0;
            }
          })
        );
        setVehicleCounts(counts);
        setError(null);
      } catch (err) {
        // Define erro
        setError(getErrorMessage(err, 'Could not load vehicle counts.'));
      } finally {
        // Finaliza carregamento
        setLoading(false);
      }
    };

    // Chama função
    fetchVehicleCounts();
  }, [customerIds]); // Re-run when customer IDs change

  // Retorna estado
  return { vehicleCounts, loading, error };
}