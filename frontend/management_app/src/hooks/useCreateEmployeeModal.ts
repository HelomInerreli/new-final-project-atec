import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

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

interface Role {
  id: number;
  name: string;
}

export const useCreateEmployeeModal = (
  show: boolean,
  onSuccess: () => void,
  onClose: () => void
) => {
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

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load roles when modal opens
  useEffect(() => {
    if (show) {
      loadRoles();
    }
  }, [show]);

  const loadRoles = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://localhost:8000/api/v1/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      console.error("Erro ao carregar funções:", err);
      setError("Erro ao carregar funções");
      toast.error("Erro ao carregar funções");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
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

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
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

      toast.success("Funcionário criado com sucesso!");
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao criar funcionário:", err);
      const errorMsg = err.response?.data?.detail || "Erro ao criar funcionário";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleClose = () => {
    resetForm();
    setError(null);
    onClose();
  };

  const selectedRole = roles.find((r) => r.id === form.role_id);

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
