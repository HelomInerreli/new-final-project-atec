/**
 * Hook personalizado para gerenciar o modal de criação de agendamentos.
 * Permite carregar dados, validar formulário e submeter agendamentos.
 */

import { useState, useEffect } from "react";
// Importa hooks do React para estado e efeitos
import { customerService } from "../services/customerService";
// Serviço para clientes
import { vehicleService } from "../services/vehicleService";
// Serviço para veículos
import { serviceService } from "../services/serviceService";
// Serviço para serviços
import { statusService } from "../services/statusService";
// Serviço para status
import { appointmentService } from "../services/appointmentService";
// Serviço para agendamentos
import type { Customer } from "../interfaces/Customer";
// Tipo para cliente
import type { Service } from "../services/serviceService";
// Tipo para serviço
import type { Vehicle } from "../interfaces/Vehicle";
// Tipo para veículo
import type { Status } from "../services/statusService";
// Tipo para status
import type { AppointmentCreate } from "../services/appointmentService";
// Tipo para criação de agendamento

// Interface para o formulário de agendamento
interface AppointmentForm {
  customer_id: number;
  vehicle_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  description: string;
  estimated_budget: number;
  status_id?: number;
}

// Formulário inicial vazio
const INITIAL_FORM: AppointmentForm = {
  customer_id: 0,
  vehicle_id: 0,
  service_id: 0,
  appointment_date: "",
  appointment_time: "",
  description: "",
  estimated_budget: 0,
  status_id: undefined,
};

// Horários disponíveis para agendamento
const AVAILABLE_TIMES = [
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00"
];

// Função para verificar se a data é fim de semana
const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Hook para gerenciar o modal de agendamento.
 * @param show - Indica se o modal está visível
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Objeto com estado, dados e funções
 */
export const useAppointmentModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
  const [loadingData, setLoadingData] = useState(false);
  // Estado de carregamento de dados
  const [submitting, setSubmitting] = useState(false);
  // Estado de submissão
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Estado para lista de clientes
  const [services, setServices] = useState<Service[]>([]);
  // Estado para lista de serviços
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Estado para lista de veículos
  const [statuses, setStatuses] = useState<Status[]>([]);
  // Estado para lista de status
  const [error, setError] = useState<string | null>(null);
  // Estado de erro
  const [form, setForm] = useState<AppointmentForm>(INITIAL_FORM);
  // Estado do formulário

  // Efeito para carregar dados iniciais quando o modal abre
  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    setError(null);
    setLoadingData(true);
    Promise.all([customerService.getAll(), serviceService.getAll(), statusService.getAll()])
      .then(([custs, svcs, stats]) => {
        setCustomers(Array.isArray(custs) ? custs : []);
        setServices(Array.isArray(svcs) ? svcs : []);
        setStatuses(Array.isArray(stats) ? stats : []);
      })
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [show]);

  // Efeito para carregar veículos do cliente selecionado
  useEffect(() => {
    if (!form.customer_id) {
      setVehicles([]);
      setForm((f) => ({ ...f, vehicle_id: 0 }));
      return;
    }
    setLoadingData(true);
    vehicleService.getByCustomerId(form.customer_id)
      .then((v) => setVehicles(Array.isArray(v) ? v : []))
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [form.customer_id]);

  // Função para alterar data e validar fim de semana
  const handleDateChange = (value: string) => {
    if (value && isWeekend(value)) {
      setError("Por favor, selecione um dia de semana (segunda a sexta-feira).");
      return;
    }
    setForm((f) => ({ ...f, appointment_date: value }));
    setError(null);
  };

  // Função para alterar serviço e atualizar orçamento
  const handleServiceChange = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    setForm((f) => ({
      ...f,
      service_id: serviceId,
      estimated_budget: service?.price ?? 0
    }));
  };

  // Função para submeter o formulário
  const handleSubmit = async () => {
    setError(null);

    if (!form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time || !form.vehicle_id) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    setSubmitting(true);
    try {
      const payload: AppointmentCreate = {
        customer_id: form.customer_id,
        vehicle_id: form.vehicle_id,
        service_id: form.service_id,
        appointment_date: `${form.appointment_date}T${form.appointment_time}`,
        description: form.description,
        estimated_budget: form.estimated_budget || 0,
        actual_budget: 0,
      };

      await appointmentService.create(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao criar agendamento"));
    } finally {
      setSubmitting(false);
    }
  };

  // Função para fechar o modal
  const handleClose = () => {
    setError(null);
    onClose();
  };

  // Dados derivados: itens selecionados
  const selectedCustomer = customers.find((c) => c.id === form.customer_id);
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
  const selectedService = services.find((s) => s.id === form.service_id);
  const selectedStatus = statuses.find((s) => s.id === form.status_id);

  return {
    // Estado
    loadingData, // Carregamento de dados
    submitting, // Submissão em progresso
    customers, // Lista de clientes
    services, // Lista de serviços
    vehicles, // Lista de veículos
    statuses, // Lista de status
    error, // Mensagem de erro
    form, // Dados do formulário
    availableTimes: AVAILABLE_TIMES, // Horários disponíveis

    // Dados derivados
    selectedCustomer, // Cliente selecionado
    selectedVehicle, // Veículo selecionado
    selectedService, // Serviço selecionado
    selectedStatus, // Status selecionado

    // Ações
    setForm, // Função para alterar formulário
    handleDateChange, // Função para alterar data
    handleServiceChange, // Função para alterar serviço
    handleSubmit, // Função para submeter
    handleClose, // Função para fechar
  };
};
