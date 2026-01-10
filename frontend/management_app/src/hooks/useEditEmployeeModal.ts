/**
 * Hook personalizado para gerenciar o modal de edição de funcionários.
 * Permite carregar funções, validar e atualizar dados de funcionários.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import type { Role } from "../interfaces/Role";
// Tipo para função

// Interface para dados do formulário de funcionário
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
  is_manager: boolean;
  has_system_access: boolean;
}

// Interface para props do hook
interface UseEditEmployeeModalProps {
  employeeId: number;
  initialData: EmployeeFormData;
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * Hook para gerenciar modal de edição de funcionário.
 * @param props - Propriedades do hook
 * @returns Estado e funções para o modal
 */
export const useEditEmployeeModal = ({
  employeeId,
  initialData,
  onSuccess,
  onClose,
}: UseEditEmployeeModalProps) => {
  // Estado do formulário
  const [form, setForm] = useState<EmployeeFormData>(initialData);
  // Estado para lista de funções
  const [roles, setRoles] = useState<Role[]>([]);
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado de carregamento
  const [loading, setLoading] = useState(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para atualizar formulário com dados iniciais
  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  // Efeito para carregar funções
  useEffect(() => {
    loadRoles();
  }, []);

  // Função para carregar funções
  const loadRoles = async () => {
    try {
      // Inicia carregamento
      setLoading(true);
      // Faz requisição GET
      const response = await fetch("http://localhost:8000/api/v1/roles");

      if (!response.ok) {
        throw new Error("Erro ao carregar funções");
      }

      // Converte resposta
      const data = await response.json();
      // Define funções
      setRoles(data);
      // Limpa erro
      setError(null);
    } catch (err) {
      // Log erro
      console.error("Erro ao carregar funções:", err);
      // Define erro
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      // Limpa funções
      setRoles([]);
    } finally {
      // Finaliza carregamento
      setLoading(false);
    }
  };

  // Função para validar formulário
  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Nome é obrigatório";
    if (!form.last_name.trim()) return "Sobrenome é obrigatório";
    if (!form.email.trim()) return "Email é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Email inválido";
    if (!form.phone.trim()) return "Telefone é obrigatório";
    if (!form.address.trim()) return "Morada é obrigatória";
    if (!form.date_of_birth) return "Data de nascimento é obrigatória";
    if (!form.hired_at) return "Data de contratação é obrigatória";
    if (form.salary === "" || parseFloat(form.salary) < 0)
      return "Salário deve ser um valor válido";
    if (!form.role_id) return "Função é obrigatória";
    return null;
  };

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Valida formulário
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      // Inicia submissão
      setSubmitting(true);

      // Prepara payload
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
        is_manager: form.is_manager,
        has_system_access: form.has_system_access,
      };

      // Faz requisição PUT
      const response = await fetch(
        `http://localhost:8000/api/v1/employees/${employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Erro ao atualizar funcionário");
      }

      // Chama sucesso
      onSuccess();
      // Fecha modal
      onClose();
    } catch (err) {
      // Log erro
      console.error("Erro ao atualizar funcionário:", err);
      // Mostra erro
      alert(
        err instanceof Error ? err.message : "Erro ao atualizar funcionário"
      );
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para fechar modal
  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  // Retorna estado e funções
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
