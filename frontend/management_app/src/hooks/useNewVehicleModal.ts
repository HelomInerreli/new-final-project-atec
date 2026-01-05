import { useState, useEffect } from 'react';
import type { VehicleCreate } from '../interfaces/Vehicle';
import type { VehicleAPI } from '../interfaces/VehicleAPI';

export function useNewVehicleModal(isOpen: boolean) {
  const [formData, setFormData] = useState<VehicleCreate>({
    plate: '',
    brand: '',
    model: '',
    kilometers: 0,
    customer_id: 0,
    color: '',
    imported: false,
    description: '',
    engineSize: '',
    fuelType: '',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        plate: '',
        brand: '',
        model: '',
        kilometers: 0,
        customer_id: 0,
        color: '',
        imported: false,
        description: '',
        engineSize: '',
        fuelType: '',
      });
    }
  }, [isOpen]);

  const handleChange = (field: keyof VehicleCreate, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const validateForm = (): boolean => {
    return !!(formData.plate && formData.brand && formData.model);
  };

  const populateFromAPI = (apiData: VehicleAPI) => {
    setFormData(prev => ({
      ...prev,
      brand: apiData.brand || prev.brand,
      model: apiData.model || prev.model,
      color: apiData.colour || prev.color,
      engineSize: apiData.engineSize || prev.engineSize,
      fuelType: apiData.fuelType || prev.fuelType,
      imported: apiData.imported !== undefined ? apiData.imported : prev.imported,
      description: apiData.description || (apiData.brand && apiData.model ? `${apiData.brand} ${apiData.model}` : prev.description),
    }));
  };

  const handleGetFromAPI = async (getFromAPIFunc?: (plate: string) => Promise<VehicleAPI | null>) => {
    if (getFromAPIFunc && formData.plate) {
      const apiData = await getFromAPIFunc(formData.plate);
      if (apiData) {
        populateFromAPI(apiData);
      }
    }
  };

  return {
    formData,
    handleChange,
    validateForm,
    populateFromAPI,
    handleGetFromAPI,
  };
}