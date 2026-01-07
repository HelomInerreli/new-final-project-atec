/**
 * Hook personalizado para gerenciar o modal de edição de serviços.
 * Permite carregar dados, validar e atualizar serviços.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import { toast } from "sonner";
// Biblioteca para toasts
import { serviceService, type Service } from "../services/serviceService";
// Serviço e tipo para serviços

// Interface para estado do formulário de serviço
interface ServiceFormState {
  name: string;
  description: string;
  price: number | "";
  duration_minutes: number;
  is_active: boolean;
}

/**
 * Hook para gerenciar modal de edição de serviço.
 * @param show - Se o modal está visível
 * @param service - Serviço a editar
 * @param onSuccess - Callback de sucesso
 * @param onClose - Callback de fechar
 * @returns Estado e funções para o modal
 */
export const useEditServiceModal = (
  show: boolean,
  service: Service | null,
  onSuccess: () => void,
  onClose: () => void
) => {
  // Estado do formulário
  const [form, setForm] = useState<ServiceFormState>({
    name: "",
    description: "",
    price: "",
    duration_minutes: 0,
    is_active: true,
  });

  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para carregar dados quando modal abre
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

  // Função para submeter formulário
  const handleSubmit = async () => {
    if (!service) return;

    // Validação
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

    // Inicia submissão
    setSubmitting(true);
    setError(null);

    try {
      // Prepara dados do serviço
      const serviceData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration_minutes: form.duration_minutes,
        is_active: form.is_active,
      };

      // Atualiza serviço
      await serviceService.update(service.id, serviceData);
      // Mostra toast de sucesso
      toast.success("Serviço atualizado com sucesso");
      // Chama sucesso
      onSuccess();
      // Fecha modal
      handleClose();
    } catch (err) {
      // Log erro
      console.error("Erro ao atualizar serviço:", err);
      // Define erro
      setError("Erro ao atualizar serviço");
      // Mostra toast de erro
      toast.error("Erro ao atualizar serviço");
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para fechar modal
  const handleClose = () => {
    // Reseta formulário
    setForm({
      name: "",
      description: "",
      price: "",
      duration_minutes: 0,
      is_active: true,
    });
    // Limpa erro
    setError(null);
    // Fecha modal
    onClose();
  };

  // Retorna estado e funções
  return {
    form,
    setForm,
    submitting,
    error,
    handleSubmit,
    handleClose,
  };
};
