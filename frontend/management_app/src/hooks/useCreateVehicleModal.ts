/**
 * Hook personalizado para gerenciar o modal de criação de veículo.
 * Permite carregar clientes e submeter formulário de criação de veículo.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import { customerService } from "../services/customerService";
// Serviço para clientes
import { vehicleService } from "../services/vehicleService";
// Serviço para veículos
import type { Customer } from "../interfaces/Customer";
// Tipo para cliente
import type { VehicleCreate } from "../interfaces/Vehicle";
// Tipo para criação de veículo

// Interface para formulário de veículo
interface VehicleForm {
  customer_id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  color: string;
  description: string;
  imported: boolean;
  engineSize: string;
  fuelType: string;
}

// Formulário inicial vazio
const INITIAL_FORM: VehicleForm = {
  customer_id: 0,
  plate: "",
  brand: "",
  model: "",
  kilometers: 0,
  color: "",
  description: "",
  imported: false,
  engineSize: "",
  fuelType: "",
};

/**
 * Hook para gerenciar modal de criação de veículo.
 * @param show - Indica se modal está visível
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Estado e funções para o modal
 */
export const useCreateVehicleModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
  // Estado de carregamento de dados
  const [loadingData, setLoadingData] = useState(false);
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado para lista de clientes
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);
  // Estado do formulário
  const [form, setForm] = useState<VehicleForm>(INITIAL_FORM);

  // Efeito para carregar clientes quando modal abre
  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    // Limpa erro
    setError(null);
    // Inicia carregamento
    setLoadingData(true);
    // Carrega clientes
    customerService.getAll()
      .then((custs) => setCustomers(Array.isArray(custs) ? custs : []))
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [show]);

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Limpa erro
    setError(null);

    // Validação básica
    if (!form.customer_id || !form.plate || !form.brand || !form.model) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    // Inicia submissão
    setSubmitting(true);
    try {
      // Prepara payload
      const payload: VehicleCreate = {
        customer_id: form.customer_id,
        plate: form.plate,
        brand: form.brand,
        model: form.model,
        kilometers: form.kilometers || 0,
        color: form.color || undefined,
        description: form.description || undefined,
        imported: form.imported,
        engineSize: form.engineSize || undefined,
        fuelType: form.fuelType || undefined,
      };

      // Cria veículo
      await vehicleService.create(payload);
      // Chama sucesso
      onSuccess();
      // Fecha modal
      onClose();
    } catch (err: any) {
      // Define erro
      setError(String(err?.message ?? "Erro ao criar veículo"));
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para fechar modal
  const handleClose = () => {
    // Limpa erro
    setError(null);
    // Fecha modal
    onClose();
  };

  // Cliente selecionado
  const selectedCustomer = customers.find((c) => c.id === form.customer_id);

  // Retorna estado e funções
  return {
    loadingData,
    submitting,
    customers,
    error,
    form,
    selectedCustomer,
    setForm,
    handleSubmit,
    handleClose,
  };
};
