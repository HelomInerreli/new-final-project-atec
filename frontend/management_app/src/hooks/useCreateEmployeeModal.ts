/**
 * Hook personalizado para gerenciar o modal de criação de funcionário.
 * Permite carregar funções, validar e submeter formulário de criação.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import axios from "axios";
// Biblioteca para requisições HTTP
import { toast } from "sonner";
// Biblioteca para notificações

// Interface para estado do formulário de funcionário
interface EmployeeFormState {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  salary: number | "";
  hired_at: string;
  role_id: number | null;
}

// Interface para função
interface Role {
  id: number;
  name: string;
}

/**
 * Hook para gerenciar modal de criação de funcionário.
 * @param show - Indica se modal está visível
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Estado e funções para o modal
 */
export const useCreateEmployeeModal = (
  show: boolean,
  onSuccess: () => void,
  onClose: () => void
) => {
  // Estado do formulário
  const [form, setForm] = useState<EmployeeFormState>({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    salary: "",
    hired_at: "",
    role_id: null,
  });

  // Estado para lista de funções
  const [roles, setRoles] = useState<Role[]>([]);
  // Estado de carregamento de dados
  const [loadingData, setLoadingData] = useState(false);
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para carregar funções quando modal abre
  useEffect(() => {
    if (show) {
      loadRoles();
    }
  }, [show]);

  // Função para carregar funções
  const loadRoles = async () => {
    // Inicia carregamento
    setLoadingData(true);
    // Limpa erro
    setError(null);
    try {
      // Obtém token
      const token = localStorage.getItem("access_token");
      // Faz requisição GET
      const response = await axios.get("http://localhost:8000/api/v1/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Define funções
      setRoles(response.data);
    } catch (err) {
      // Log erro
      console.error("Erro ao carregar funções:", err);
      // Define erro
      setError("Erro ao carregar funções");
      // Mostra toast de erro
      toast.error("Erro ao carregar funções");
    } finally {
      // Finaliza carregamento
      setLoadingData(false);
    }
  };

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Validações
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!form.last_name.trim()) {
      toast.error("Apelido é obrigatório");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }
    if (!form.address.trim()) {
      toast.error("Morada é obrigatória");
      return;
    }
    if (!form.date_of_birth) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }
    if (form.salary === "" || form.salary <= 0) {
      toast.error("Salário deve ser um número positivo");
      return;
    }
    if (!form.hired_at) {
      toast.error("Data de contratação é obrigatória");
      return;
    }
    if (!form.role_id) {
      toast.error("Função é obrigatória");
      return;
    }

    // Inicia submissão
    setSubmitting(true);
    // Limpa erro
    setError(null);

    try {
      // Obtém token
      const token = localStorage.getItem("access_token");
      // Faz requisição POST
      await axios.post(
        "http://localhost:8000/api/v1/employees",
        {
          ...form,
          salary: Number(form.salary),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Mostra sucesso
      toast.success("Funcionário criado com sucesso!");
      // Reseta formulário
      resetForm();
      // Chama callbacks
      onSuccess();
      onClose();
    } catch (err: any) {
      // Log erro
      console.error("Erro ao criar funcionário:", err);
      // Define mensagem de erro
      const errorMsg = err.response?.data?.detail || "Erro ao criar funcionário";
      // Define erro
      setError(errorMsg);
      // Mostra toast de erro
      toast.error(errorMsg);
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setForm({
      name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      date_of_birth: "",
      salary: "",
      hired_at: "",
      role_id: null,
    });
  };

  // Função para fechar modal
  const handleClose = () => {
    // Reseta formulário
    resetForm();
    // Limpa erro
    setError(null);
    // Fecha modal
    onClose();
  };

  // Função selecionada
  const selectedRole = roles.find((r) => r.id === form.role_id);

  // Retorna estado e funções
  return {
    form,
    setForm,
    roles,
    selectedRole,
    loadingData,
    submitting,
    error,
    handleSubmit,
    handleClose,
  };
};
