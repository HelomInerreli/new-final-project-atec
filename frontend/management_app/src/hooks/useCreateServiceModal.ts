import { useState, useEffect } from "react";
import { toast } from "sonner";
import { serviceService } from "../services/serviceService";

interface ServiceFormState {
  name: string;
  description: string;
  price: number | "";
  duration_minutes: number;
  is_active: boolean;
}

export const useCreateServiceModal = (
  show: boolean,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [form, setForm] = useState<ServiceFormState>({
    name: "",
    description: "",
    price: "",
    duration_minutes: 0,
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setForm({
        name: "",
        description: "",
        price: "",
        duration_minutes: 0,
        is_active: true,
      });
      setError(null);
    }
  }, [show]);

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (form.price === "" || form.price <= 0) {
      toast.error("Preço deve ser um número positivo");
      return;
    }
    if (!form.duration_minutes || form.duration_minutes <= 0) {
      toast.error("Duração deve ser maior que 0");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const serviceData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration_minutes: form.duration_minutes,
        is_active: form.is_active,
      };

      await serviceService.create(serviceData);
      toast.success("Serviço criado com sucesso");
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao criar serviço:", err);
      setError("Erro ao criar serviço");
      toast.error("Erro ao criar serviço");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      duration_minutes: 0,
      is_active: true,
    });
    setError(null);
    onClose();
  };

  return {
    form,
    setForm,
    submitting,
    error,
    handleSubmit,
    handleClose,
  };
};
