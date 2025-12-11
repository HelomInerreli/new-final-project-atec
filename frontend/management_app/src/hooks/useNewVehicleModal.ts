import { useState, useEffect } from 'react';
import type { VehicleCreate } from '../interfaces/Vehicle';

export function useNewVehicleModal(isOpen: boolean) {
  const [formData, setFormData] = useState<VehicleCreate>({
    plate: '',
    brand: '',
    model: '',
    kilometers: 0,
    customer_id: 0,
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
      });
    }
  }, [isOpen]);

  const handleChange = (field: keyof VehicleCreate, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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