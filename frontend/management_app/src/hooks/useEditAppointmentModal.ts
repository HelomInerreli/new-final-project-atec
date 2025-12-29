import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";
import { vehicleService } from "../services/vehicleService";
import { serviceService } from "../services/serviceService";
import { statusService } from "../services/statusService";
import { appointmentService } from "../services/appointmentService";
import type { Customer } from "../interfaces/Customer";
import type { Service } from "../services/serviceService";
import type { Vehicle } from "../interfaces/Vehicle";
import type { Status } from "../services/statusService";
import type { AppointmentUpdate, Appointment } from "../services/appointmentService";

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

const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const useEditAppointmentModal = (
  show: boolean, 
  appointment: Appointment | null,
  onSuccess: () => void, 
  onClose: () => void
) => {
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AppointmentForm>(INITIAL_FORM);

  // Carregar dados iniciais
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

  // Preencher formulário com dados do agendamento
  useEffect(() => {
    if (!show || !appointment) return;

    const appointmentDateTime = new Date(appointment.appointment_date);
    const dateStr = appointmentDateTime.toISOString().split("T")[0];
    const timeStr = appointmentDateTime.toTimeString().slice(0, 5);

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

  // Carregar veículos quando seleciona cliente
  useEffect(() => {
    if (!form.customer_id) {
      setVehicles([]);
      return;
    }
    setLoadingData(true);
    vehicleService.getByCustomerId(form.customer_id)
      .then((v) => setVehicles(Array.isArray(v) ? v : []))
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [form.customer_id]);

  // Validar data (fins de semana)
  const handleDateChange = (value: string) => {
    if (value && isWeekend(value)) {
      setError("Por favor, selecione um dia de semana (segunda a sexta-feira).");
      return;
    }
    setForm((f) => ({ ...f, appointment_date: value }));
    setError(null);
  };

  // Atualizar serviço e orçamento
  const handleServiceChange = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    setForm((f) => ({ 
      ...f, 
      service_id: serviceId, 
      estimated_budget: service?.price ?? 0 
    }));
  };

  // Submeter formulário
  const handleSubmit = async () => {
    setError(null);

    if (!appointment) {
      return setError("Agendamento não encontrado.");
    }

    if (!form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time || !form.vehicle_id) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    setSubmitting(true);
    try {
      const payload: AppointmentUpdate = {
        vehicle_id: form.vehicle_id,
        service_id: form.service_id,
        appointment_date: `${form.appointment_date}T${form.appointment_time}`,
        description: form.description,
        estimated_budget: form.estimated_budget || 0,
        status_id: form.status_id,
      };

      await appointmentService.update(appointment.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao atualizar agendamento"));
    } finally {
      setSubmitting(false);
    }
  };

  // Fechar modal
  const handleClose = () => {
    setError(null);
    onClose();
  };

  // Dados derivados
  const selectedCustomer = customers.find((c) => c.id === form.customer_id);
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
  const selectedService = services.find((s) => s.id === form.service_id);
  const selectedStatus = statuses.find((s) => s.id === form.status_id);

  return {
    // State
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
    
    // Actions
    setForm,
    handleDateChange,
    handleServiceChange,
    handleSubmit,
    handleClose,
  };
};
