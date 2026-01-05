import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import type { Vehicle, VehicleUpdate } from '../interfaces/Vehicle';
import type { Customer, CompleteCustomerProfile } from '../interfaces/Customer';
import { useToast } from './use-toast';
import { getErrorMessage } from '../utils/errorHandler';

interface VehicleDetailsData {
  vehicle: Vehicle;
  customer: Customer | null;
}

export function useFetchVehicleById(vehicleId: string | undefined) {
  const [vehicleData, setVehicleData] = useState<VehicleDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      setError('No vehicle ID provided');
      return;
    }
    
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        // Fetch vehicle details
        const vehicleResponse = await http.get(`/vehicles/${vehicleId}`);
        const vehicle = vehicleResponse.data;

        // Fetch customer if vehicle has one
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

        const data: VehicleDetailsData = { vehicle, customer };

        setVehicleData(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load vehicle details.'));
        setVehicleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const updateVehicle = async (updatedData: VehicleUpdate) => {
    if (!vehicleId) return;
    try {
      const response = await http.put(`/vehicles/${vehicleId}`, updatedData);
      
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
      console.error('Failed to update vehicle:', err);
      throw err;
    }
  };

  return { vehicleData, loading, error, updateVehicle };
}

// Enhanced hook with all business logic for VehicleDetails page
export function useVehicleDetailsPage(vehicleId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
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

  const { vehicleData, loading, error, updateVehicle } = useFetchVehicleById(vehicleId);

  // Update form data when vehicle data is loaded
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

  const handleSave = async () => {
    try {
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
      setIsEditing(false);
      toast({
        title: "Alterações salvas",
        description: "Os dados do veículo foram atualizados com sucesso.",
      });
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: getErrorMessage(err, "Não foi possível atualizar os dados do veículo."),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!vehicleId) return;
    
    try {
      await http.delete(`/vehicles/${vehicleId}`);
      toast({
        title: "Veículo excluído",
        description: "O veículo foi removido do sistema.",
        variant: "destructive",
      });
      navigate("/vehicles");
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: getErrorMessage(err, "Não foi possível excluir o veículo."),
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof VehicleUpdate, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
