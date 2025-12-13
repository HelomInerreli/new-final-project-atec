import { useState, useEffect } from 'react';
import type { VehicleCreate } from '../interfaces/Vehicle';

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
      // Updates description when brand or model changes
      if (field === 'brand' || field === 'model') {
        const brand = field === 'brand' ? value : prev.brand;
        const model = field === 'model' ? value : prev.model;
        updated.description = brand && model ? `${brand} ${model}` : '';
      }
      
      return updated;
    });
  };

  const validateForm = (): boolean => {
    return !!(formData.plate && formData.brand && formData.model && formData.customer_id);
  };

  return {
    formData,
    handleChange,
    validateForm,
  };
}