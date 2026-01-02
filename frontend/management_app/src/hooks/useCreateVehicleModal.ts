import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";
import { vehicleService } from "../services/vehicleService";
import type { Customer } from "../interfaces/Customer";
import type { VehicleCreate } from "../interfaces/Vehicle";

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

export const useCreateVehicleModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(INITIAL_FORM);

  // Carregar clientes quando o modal abre
  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    setError(null);
    setLoadingData(true);
    customerService.getAll()
      .then((custs) => setCustomers(Array.isArray(custs) ? custs : []))
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [show]);

  // Submeter formulário
  const handleSubmit = async () => {
    setError(null);

    // Validação
    if (!form.customer_id || !form.plate || !form.brand || !form.model) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    setSubmitting(true);
    try {
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

      await vehicleService.create(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao criar veículo"));
    } finally {
      setSubmitting(false);
    }
  };

  // Fechar modal
  const handleClose = () => {
    setError(null);
    onClose();
  };

  // Dados derivados
  const selectedCustomer = customers.find((c) => c.id === form.customer_id);

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
