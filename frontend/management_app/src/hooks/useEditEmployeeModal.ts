import { useState, useEffect } from "react";
import type { Role } from "../interfaces/Role";

export interface EmployeeFormData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  salary: string;
  address: string;
  date_of_birth: string;
  hired_at: string;
  role_id: string;
}

interface UseEditEmployeeModalProps {
  employeeId: number;
  initialData: EmployeeFormData;
  onSuccess: () => void;
  onClose: () => void;
}

export const useEditEmployeeModal = ({ employeeId, initialData, onSuccess, onClose }: UseEditEmployeeModalProps) => {
  const [form, setForm] = useState<EmployeeFormData>(initialData);
  const [roles, setRoles] = useState<Role[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/roles");
      
      if (!response.ok) {
        throw new Error("Erro ao carregar funções");
      }

      const data = await response.json();
      setRoles(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar funções:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Nome é obrigatório";
    if (!form.last_name.trim()) return "Sobrenome é obrigatório";
    if (!form.email.trim()) return "Email é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Email inválido";
    if (!form.phone.trim()) return "Telefone é obrigatório";
    if (!form.address.trim()) return "Morada é obrigatória";
    if (!form.date_of_birth) return "Data de nascimento é obrigatória";
    if (!form.hired_at) return "Data de contratação é obrigatória";
    if (form.salary === "" || parseFloat(form.salary) < 0) return "Salário deve ser um valor válido";
    if (!form.role_id) return "Função é obrigatória";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        salary: parseFloat(form.salary),
        address: form.address.trim(),
        date_of_birth: form.date_of_birth,
        hired_at: form.hired_at,
        role_id: parseInt(form.role_id),
      };

      const response = await fetch(`http://localhost:8000/api/v1/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Erro ao atualizar funcionário");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar funcionário:", err);
      alert(err instanceof Error ? err.message : "Erro ao atualizar funcionário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return {
    form,
    setForm,
    roles,
    loading,
    error,
    submitting,
    handleSubmit,
    handleClose,
  };
};
