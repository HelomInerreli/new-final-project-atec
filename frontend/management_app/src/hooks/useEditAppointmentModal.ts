/**
 * Hook personalizado para gerenciar o modal de edição de agendamentos.
 * Permite carregar dados, preencher formulário e atualizar agendamentos.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
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
import type { AppointmentUpdate, Appointment } from "../services/appointmentService";
// Tipos para atualização e agendamento

// Interface para formulário de agendamento
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
 * Hook para gerenciar modal de edição de agendamento.
 * @param show - Indica se modal está visível
 * @param appointment - Agendamento a editar
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Estado e funções para o modal
 */
export const useEditAppointmentModal = (
  show: boolean, 
  appointment: Appointment | null,
  onSuccess: () => void, 
  onClose: () => void
) => {
  // Estado de carregamento de dados
  const [loadingData, setLoadingData] = useState(false);
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado para lista de clientes
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Estado para lista de serviços
  const [services, setServices] = useState<Service[]>([]);
  // Estado para lista de veículos
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Estado para lista de status
  const [statuses, setStatuses] = useState<Status[]>([]);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);
  // Estado do formulário
  const [form, setForm] = useState<AppointmentForm>(INITIAL_FORM);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    // Limpa erro
    setError(null);
    // Inicia carregamento
    setLoadingData(true);
    // Carrega clientes, serviços e status
    Promise.all([customerService.getAll(), serviceService.getAll(), statusService.getAll()])
      .then(([custs, svcs, stats]) => {
        setCustomers(Array.isArray(custs) ? custs : []);
        setServices(Array.isArray(svcs) ? svcs : []);
        setStatuses(Array.isArray(stats) ? stats : []);
      })
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [show]);

  // Efeito para preencher formulário com dados do agendamento
  useEffect(() => {
    if (!show || !appointment) return;

    // Converte data e hora
    const appointmentDateTime = new Date(appointment.appointment_date);
    const dateStr = appointmentDateTime.toISOString().split("T")[0];
    const timeStr = appointmentDateTime.toTimeString().slice(0, 5);

    // Define formulário
    setForm({
      customer_id: appointment.customer_id || 0,
      vehicle_id: appointment.vehicle_id || 0,
      service_id: appointment.service_id || 0,
      appointment_date: dateStr,
      appointment_time: timeStr,
      description: appointment.description || "",
      estimated_budget: appointment.estimated_budget || 0,
      status_id: appointment.status_id,
    });
  }, [show, appointment]);

  // Efeito para carregar veículos do cliente selecionado
  useEffect(() => {
    if (!form.customer_id) {
      setVehicles([]);
      return;
    }
    // Inicia carregamento
    setLoadingData(true);
    // Carrega veículos
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

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Limpa erro
    setError(null);

    if (!appointment) {
      return setError("Agendamento não encontrado.");
    }

    if (!form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time || !form.vehicle_id) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    // Inicia submissão
    setSubmitting(true);
    try {
      // Prepara payload
      const payload: AppointmentUpdate = {
        vehicle_id: form.vehicle_id,
        service_id: form.service_id,
        appointment_date: `${form.appointment_date}T${form.appointment_time}`,
        description: form.description,
        estimated_budget: form.estimated_budget || 0,
        status_id: form.status_id,
      };

      // Atualiza agendamento
      await appointmentService.update(appointment.id, payload);
      // Chama sucesso
      onSuccess();
      // Fecha modal
      onClose();
    } catch (err: any) {
      // Define erro
      setError(String(err?.message ?? "Erro ao atualizar agendamento"));
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para fechar modal
  const handleClose = () => {
    // Limpa erro
    setError(null);
    // Fecha modal
    onClose();
  };

  // Dados derivados: itens selecionados
  const selectedCustomer = customers.find((c) => c.id === form.customer_id);
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
  const selectedService = services.find((s) => s.id === form.service_id);
  const selectedStatus = statuses.find((s) => s.id === form.status_id);

  // Retorna estado e funções
  return {
    // Estado
    loadingData,
    submitting,
    customers,
    services,
    vehicles,
    statuses,
    error,
    form,
    availableTimes: AVAILABLE_TIMES,
    
    // Dados derivados
    selectedCustomer,
    selectedVehicle,
    selectedService,
    selectedStatus,
    
    // Ações
    setForm,
    handleDateChange,
    handleServiceChange,
    handleSubmit,
    handleClose,
  };
};
