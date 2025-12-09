import { useState, useMemo } from 'react';
import { useFetchVehicles } from './useVehicles';
import { vehicleService } from '../services/vehicleService';
import { toast } from './use-toast';
import type { VehicleCreate } from '../interfaces/Vehicle';

export function useVehiclesPage() {
  // Fetch vehicles with refetch capability
  const { vehicles: rawVehicles, loading, error, refetch } = useFetchVehicles();

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);

  // Map backend data
  const vehicles = useMemo(() => {
    return rawVehicles.map(vehicle => ({
      id: vehicle.id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      kilometers: vehicle.kilometers || 0,
      customerName: vehicle.customer_name || 'Unknown',
      customerId: vehicle.customer_id,
    }));
  }, [rawVehicles]);

  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [vehicles, searchTerm]);

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

  return {
    // Data
    filteredVehicles,
    loading,
    error,

    // UI State
    searchTerm,
    setSearchTerm,
    newVehicleModalOpen,
    setNewVehicleModalOpen,
    creatingVehicle,
    deleteDialogOpen,
    setDeleteDialogOpen,

    // Handlers
    handleDelete,
    confirmDelete,
    handleCreateVehicle,
    formatKilometers,
  };
}
