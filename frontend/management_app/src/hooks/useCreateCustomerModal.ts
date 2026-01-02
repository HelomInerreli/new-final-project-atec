import { useState, useEffect } from "react";
import type { CustomerRegister } from "../interfaces/Customer";

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

export const useCreateCustomerModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(INITIAL_FORM);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [show]);

  // Submeter formulário
  const handleSubmit = async () => {
    setError(null);

    // Validação
    if (!form.name || !form.email || !form.password) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return setError("Email inválido.");
    }

    // Validar password (mínimo 6 caracteres)
    if (form.password.length < 6) {
      return setError("A password deve ter pelo menos 6 caracteres.");
    }

    setSubmitting(true);
    try {
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

      const response = await fetch('http://localhost:8000/api/v1/customersauth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar cliente');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao criar cliente"));
    } finally {
      setSubmitting(false);
    }
  };

  // Fechar modal
  const handleClose = () => {
    setError(null);
    onClose();
  };

  return {
    submitting,
    error,
    form,
    setForm,
    handleSubmit,
    handleClose,
  };
};
