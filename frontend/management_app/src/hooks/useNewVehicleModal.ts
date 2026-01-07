/**
 * Hook personalizado para gerenciar modal de novo veículo.
 * Permite gerenciar formulário, validação e preenchimento via API.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import type { VehicleCreate } from '../interfaces/Vehicle';
// Tipo para criação de veículo
import type { VehicleAPI } from '../interfaces/VehicleAPI';
// Tipo para dados da API de veículo

/**
 * Hook para gerenciar modal de novo veículo.
 * @param isOpen - Se o modal está aberto
 * @returns Estado e funções para o modal
 */
export function useNewVehicleModal(isOpen: boolean) {
  // Estado dos dados do formulário
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

  // Efeito para resetar formulário quando modal fecha
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

  // Função para lidar com mudança de campo
  const handleChange = (field: keyof VehicleCreate, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  // Função para validar formulário
  const validateForm = (): boolean => {
    return !!(formData.plate && formData.brand && formData.model);
  };

  // Função para preencher dados da API
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

  // Função para buscar dados da API
  const handleGetFromAPI = async (getFromAPIFunc?: (plate: string) => Promise<VehicleAPI | null>) => {
    if (getFromAPIFunc && formData.plate) {
      // Busca dados da API
      const apiData = await getFromAPIFunc(formData.plate);
      if (apiData) {
        // Preenche formulário
        populateFromAPI(apiData);
      }
    }
  };

  // Retorna estado e funções
  return {
    formData,
    handleChange,
    validateForm,
    populateFromAPI,
    handleGetFromAPI,
  };
}