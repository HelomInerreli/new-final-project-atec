/**
 * Hook personalizado para gerenciar o modal de criação de serviço.
 * Permite validar e submeter formulário de criação de serviço.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import { toast } from "sonner";
// Biblioteca para notificações
import { serviceService } from "../services/serviceService";
// Serviço para operações de serviço

// Interface para estado do formulário de serviço
interface ServiceFormState {
  name: string;
  description: string;
  price: number | "";
  duration_minutes: number;
  is_active: boolean;
}

/**
 * Hook para gerenciar modal de criação de serviço.
 * @param show - Indica se modal está visível
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Estado e funções para o modal
 */
export const useCreateServiceModal = (
  show: boolean,
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

  // Efeito para resetar formulário quando modal abre
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

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Validações
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
    // Limpa erro
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

      // Cria serviço via serviço
      await serviceService.create(serviceData);
      // Mostra sucesso
      toast.success("Serviço criado com sucesso");
      // Chama callback de sucesso
      onSuccess();
      // Fecha modal
      handleClose();
    } catch (err) {
      // Log erro
      console.error("Erro ao criar serviço:", err);
      // Define erro
      setError("Erro ao criar serviço");
      // Mostra toast de erro
      toast.error("Erro ao criar serviço");
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
