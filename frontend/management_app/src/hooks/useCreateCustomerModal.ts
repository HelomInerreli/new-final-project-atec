/**
 * Hook personalizado para gerenciar o modal de criação de cliente.
 * Permite validar e submeter formulário de registo de cliente.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import type { CustomerRegister } from "../interfaces/Customer";
// Tipo para registo de cliente

// Interface para formulário de cliente
interface CustomerForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  birth_date: string;
}

// Formulário inicial vazio
const INITIAL_FORM: CustomerForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
  postal_code: "",
  country: "",
  birth_date: "",
};

/**
 * Hook para gerenciar modal de criação de cliente.
 * @param show - Indica se modal está visível
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Estado e funções para o modal
 */
export const useCreateCustomerModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);
  // Estado do formulário
  const [form, setForm] = useState<CustomerForm>(INITIAL_FORM);

  // Efeito para resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [show]);

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Limpa erro
    setError(null);

    // Validação básica
    if (!form.name || !form.email || !form.password) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return setError("Email inválido.");
    }

    // Validar password
    if (form.password.length < 6) {
      return setError("A password deve ter pelo menos 6 caracteres.");
    }

    // Inicia submissão
    setSubmitting(true);
    try {
      // Prepara payload
      const payload: CustomerRegister = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        postal_code: form.postal_code || undefined,
        country: form.country || undefined,
        birth_date: form.birth_date || undefined,
      };

      // Faz requisição POST
      const response = await fetch('http://localhost:8000/api/v1/customersauth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Verifica resposta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar cliente');
      }

      // Sucesso
      onSuccess();
      onClose();
    } catch (err: any) {
      // Define erro
      setError(String(err?.message ?? "Erro ao criar cliente"));
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para fechar modal
  const handleClose = () => {
    // Limpa erro
    setError(null);
    onClose();
  };

  // Retorna estado e funções
  return {
    submitting,
    error,
    form,
    setForm,
    handleSubmit,
    handleClose,
  };
};
