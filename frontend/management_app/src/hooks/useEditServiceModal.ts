import { useState, useEffect } from "react";
import { toast } from "sonner";
import { serviceService, type Service } from "../services/serviceService";

interface ServiceFormState {
  name: string;
  description: string;
  price: number | "";
  duration_minutes: number;
  is_active: boolean;
}

export const useEditServiceModal = (
  show: boolean,
  service: Service | null,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [form, setForm] = useState<ServiceFormState>({
    name: "",
    description: "",
    price: "",
    duration_minutes: 30,
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load service data when modal opens
  useEffect(() => {
    if (show && service) {
      setForm({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration_minutes: service.duration_minutes || 30,
        is_active: service.is_active ?? true,
      });
      setError(null);
    }
  }, [show, service]);

  const handleSubmit = async () => {
    if (!service) return;

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

      await serviceService.update(service.id, serviceData);
      toast.success("Serviço atualizado com sucesso");
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao atualizar serviço:", err);
      setError("Erro ao atualizar serviço");
      toast.error("Erro ao atualizar serviço");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      duration_minutes: 30,
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
