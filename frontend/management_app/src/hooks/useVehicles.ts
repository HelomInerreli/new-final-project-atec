import { useState, useEffect, useCallback, useMemo } from 'react';
import http from '../api/http';
import type { Vehicle, VehicleCreate, VehicleCountMap, VehicleWithCustomer } from '../interfaces/Vehicle';
import { vehicleService } from '../services/vehicleService';
import { vehicleService as vehicleAPIService } from '../services/vehicleAPIService';
import { toast } from './use-toast';

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
              customer_name: customerResponse.data.name || null,
            };
          } catch {
            return {
              ...vehicle,
              customer_name: null,
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

export function useVehiclesPage() {
  // Fetch vehicles with refetch capability
  const { vehicles: rawVehicles, loading, error, refetch } = useFetchVehicles();

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Map backend data
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

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFiltro]);

  // Filter vehicles based on search term
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

  // Pagination
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
        await vehicleService.delete(vehicleToDelete);
        toast({
          title: 'Veículo eliminado',
          description: 'O veículo foi eliminado com sucesso.',
        });
        refetch();
      } catch {
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

  const handleCreateVehicle = async (vehicleData: VehicleCreate) => {
    setCreatingVehicle(true);
    try {
      await vehicleService.create(vehicleData);
      toast({ title: 'Veículo Criado', description: 'O novo veículo foi criado com sucesso.' });
      setNewVehicleModalOpen(false);
      refetch();
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Create vehicle error:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.detail || 'Não foi possível criar o veículo.',
        variant: 'destructive',
      });
    } finally {
      setCreatingVehicle(false);
    }
  };

  const formatKilometers = (km: number) => {
    return km > 0 ? `${km.toLocaleString('pt-PT')} km` : '0 km';
  };

  const getFromAPI = async (plate: string) => {
    try {
      const vehicleData = await vehicleAPIService.getByPlate(plate);
      toast({ 
        title: 'Veículo encontrado', 
        description: `Dados do veículo ${vehicleData.brand} ${vehicleData.model} obtidos da API.` 
      });
      return vehicleData;
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Get vehicle from API error:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.detail || 'Não foi possível obter os dados do veículo da API.',
        variant: 'destructive',
      });
      throw err;
    }
  };

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
    setStatusFiltro,

    // Pagination
    page,
    setPage,
    totalPages,
    pageSize,

    // Handlers
    handleDelete,
    confirmDelete,
    handleCreateVehicle,
    formatKilometers,
    getFromAPI,
  };
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
            } catch (err: any) {
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