/**
 * Hook personalizado para gerenciar detalhes de veículo.
 * Permite buscar veículo por ID, atualizar dados e gerenciar página de detalhes.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import { useNavigate } from 'react-router-dom';
// Hook de navegação
import http from '../api/http';
// Cliente HTTP
import type { Vehicle, VehicleUpdate } from '../interfaces/Vehicle';
// Tipos para veículo
import type { Customer, CompleteCustomerProfile } from '../interfaces/Customer';
// Tipos para cliente
import { useToast } from './use-toast';
// Hook para toasts
import { getErrorMessage } from '../utils/errorHandler';
// Utilitário para mensagens de erro

// Interface para dados de detalhes do veículo
interface VehicleDetailsData {
  vehicle: Vehicle;
  customer: Customer | null;
}

/**
 * Hook para buscar veículo por ID.
 * @param vehicleId - ID do veículo
 * @returns Dados do veículo, carregamento, erro e função de atualização
 */
export function useFetchVehicleById(vehicleId: string | undefined) {
  // Estado para dados do veículo
  const [vehicleData, setVehicleData] = useState<VehicleDetailsData | null>(null);
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar veículo quando ID muda
  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      setError('No vehicle ID provided');
      return;
    }

    // Função para buscar veículo
    const fetchVehicle = async () => {
      // Inicia carregamento
      setLoading(true);
      try {
        // Busca detalhes do veículo
        const vehicleResponse = await http.get(`/vehicles/${vehicleId}`);
        const vehicle = vehicleResponse.data;

        // Busca cliente se veículo tiver um
        let customer = null;
        if (vehicle.customer_id && vehicle.customer_id !== 0) {
            const allProfilesResponse = await http.get('/customers/all-profiles');
            const customerProfile = allProfilesResponse.data.find(
                (profile: CompleteCustomerProfile) => profile.customer.id === vehicle.customer_id
            );
            if (customerProfile) {
              customer = customerProfile.customer;
            }
        }

        // Define dados
        const data: VehicleDetailsData = { vehicle, customer };

        setVehicleData(data);
        setError(null);
      } catch (err) {
        // Define erro
        setError(getErrorMessage(err, 'Could not load vehicle details.'));
        setVehicleData(null);
      } finally {
        // Finaliza carregamento
        setLoading(false);
      }
    };

    // Chama função
    fetchVehicle();
  }, [vehicleId]);

  // Função para atualizar veículo
  const updateVehicle = async (updatedData: VehicleUpdate) => {
    if (!vehicleId) return;
    try {
      // Faz requisição PUT
      const response = await http.put(`/vehicles/${vehicleId}`, updatedData);

      // Atualiza estado local
      setVehicleData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          vehicle: {
            ...prev.vehicle,
            ...response.data
          }
        };
      });
      return response.data;
    } catch (err) {
      // Log erro
      console.error('Failed to update vehicle:', err);
      // Re-lança erro
      throw err;
    }
  };

  // Retorna estado e funções
  return { vehicleData, loading, error, updateVehicle };
}

/**
 * Hook aprimorado para página de detalhes do veículo.
 * @param vehicleId - ID do veículo
 * @returns Estado e funções para a página
 */
export function useVehicleDetailsPage(vehicleId: string | undefined) {
  // Hook de navegação
  const navigate = useNavigate();
  // Hook de toast
  const { toast } = useToast();
  // Estado de edição
  const [isEditing, setIsEditing] = useState(false);
  // Estado dos dados do formulário
  const [formData, setFormData] = useState<VehicleUpdate>({
    plate: "",
    brand: "",
    model: "",
    kilometers: 0,
    description: "",
    color: "",
    imported: false,
    engineSize: "",
    fuelType: "",
  });

  // Busca dados do veículo
  const { vehicleData, loading, error, updateVehicle } = useFetchVehicleById(vehicleId);

  // Efeito para atualizar formulário quando dados carregam
  useEffect(() => {
    if (vehicleData) {
      setFormData({
        plate: vehicleData.vehicle.plate || "",
        brand: vehicleData.vehicle.brand || "",
        model: vehicleData.vehicle.model || "",
        kilometers: vehicleData.vehicle.kilometers || 0,
        description: vehicleData.vehicle.description || "",
        color: vehicleData.vehicle.color || "",
        imported: vehicleData.vehicle.imported || false,
        engineSize: vehicleData.vehicle.engineSize || "",
        fuelType: vehicleData.vehicle.fuelType || "",
      });
    }
  }, [vehicleData]);

  // Função para salvar alterações
  const handleSave = async () => {
    try {
      // Atualiza veículo
      await updateVehicle({
        plate: formData.plate,
        brand: formData.brand,
        model: formData.model,
        kilometers: formData.kilometers,
        description: formData.description,
        color: formData.color,
        imported: formData.imported,
        engineSize: formData.engineSize,
        fuelType: formData.fuelType,
      });
      // Desativa edição
      setIsEditing(false);
      // Mostra toast de sucesso
      toast({
        title: "Alterações salvas",
        description: "Os dados do veículo foram atualizados com sucesso.",
      });
    } catch (err) {
      // Mostra toast de erro
      toast({
        title: "Erro ao salvar",
        description: getErrorMessage(err, "Não foi possível atualizar os dados do veículo."),
        variant: "destructive",
      });
    }
  };

  // Função para excluir veículo
  const handleDelete = async () => {
    if (!vehicleId) return;

    try {
      // Faz requisição DELETE
      await http.delete(`/vehicles/${vehicleId}`);
      // Mostra toast de exclusão
      toast({
        title: "Veículo excluído",
        description: "O veículo foi removido do sistema.",
        variant: "destructive",
      });
      // Navega para lista
      navigate("/vehicles");
    } catch (err) {
      // Mostra toast de erro
      toast({
        title: "Erro ao excluir",
        description: getErrorMessage(err, "Não foi possível excluir o veículo."),
        variant: "destructive",
      });
    }
  };

  // Função para lidar com mudança de input
  const handleInputChange = (field: keyof VehicleUpdate, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Retorna estado e funções
  return {
    // Data
    vehicleData,
    loading,
    error,

    // Form state
    isEditing,
    setIsEditing,
    formData,
    setFormData,

    // Handlers
    handleSave,
    handleDelete,
    handleInputChange,
  };
}
