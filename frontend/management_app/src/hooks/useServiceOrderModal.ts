import { useState, useEffect } from "react";
import { getCustomers, getCustomerVehicles, getServices, createAppointment } from "../services/ServiceOrders";
import type { Customer } from "../interfaces/Customer";
import type { Service } from "../interfaces/Service";
import type { Vehicle } from "../interfaces/Vehicle";
import type { CreateAppointmentPayload } from "../interfaces/Payload";
import type { ServiceOrderForm } from "../interfaces/ServiceOrderModal";

/**
 * Formulário inicial vazio para criação de ordem de serviço
 * Contém todos os campos necessários com valores padrão
 */
const INITIAL_FORM: ServiceOrderForm = {
  customer_id: 0,
  vehicle_id: 0,
  service_id: 0,
  appointment_date: "",
  appointment_time: "",
  description: "",
  estimated_budget: 0,
};

/**
 * Array com os horários disponíveis para agendamento
 * Intervalos de 15 minutos das 09:00 às 17:00
 */
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

/**
 * Função auxiliar para verificar se uma data é fim de semana
 * @param dateString - Data em formato string (YYYY-MM-DD)
 * @returns true se for sábado ou domingo, false caso contrário
 */
const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Hook para gerir o modal de criação de ordens de serviço
 * @param show - Estado de visibilidade do modal
 * @param onSuccess - Callback executado quando a ordem é criada com sucesso
 * @param onClose - Callback para fechar o modal
 * @returns Objeto com estados, dados e ações do modal
 */
export const useServiceOrderModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
  /**
   * Estado para controlar o passo atual do formulário (1, 2 ou 3)
   * Tipo: number
   * Inicia em 1 (primeiro passo)
   */
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * Estado para indicar se os dados estão sendo carregados
   * Tipo: boolean
   * Inicia como false
   */
  const [loadingData, setLoadingData] = useState(false);

  /**
   * Estado para indicar se o formulário está sendo submetido
   * Tipo: boolean
   * Inicia como false
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * Estado para armazenar a lista de clientes
   * Tipo: Array de Customer
   * Inicia como array vazio
   */
  const [customers, setCustomers] = useState<Customer[]>([]);

  /**
   * Estado para armazenar a lista de serviços disponíveis
   * Tipo: Array de Service
   * Inicia como array vazio
   */
  const [services, setServices] = useState<Service[]>([]);

  /**
   * Estado para armazenar a lista de veículos do cliente selecionado
   * Tipo: Array de Vehicle
   * Inicia como array vazio
   */
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  /**
   * Estado para armazenar mensagens de erro
   * Tipo: string | null
   * Inicia como null (sem erro)
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Estado para armazenar os dados do formulário
   * Tipo: ServiceOrderForm
   * Inicia com valores padrão do INITIAL_FORM
   */
  const [form, setForm] = useState<ServiceOrderForm>(INITIAL_FORM);

  /**
   * Efeito para carregar dados iniciais quando o modal é aberto
   * Carrega lista de clientes e serviços
   * Reset do formulário e erro quando o modal fecha
   */
  useEffect(() => {
    if (!show) {
      setCurrentStep(1);
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    setError(null);
    setLoadingData(true);
    Promise.all([getCustomers(), getServices()])
      .then(([custs, svcs]) => {
        setCustomers(Array.isArray(custs) ? custs : []);
        setServices(Array.isArray(svcs) ? svcs : []);
      })
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [show]);

  /**
   * Efeito para carregar veículos quando um cliente é selecionado
   * Reset da lista de veículos e veículo selecionado quando não há cliente
   */
  useEffect(() => {
    if (!form.customer_id) {
      setVehicles([]);
      setForm((f) => ({ ...f, vehicle_id: 0 }));
      return;
    }
    setLoadingData(true);
    getCustomerVehicles(form.customer_id)
      .then((v) => setVehicles(Array.isArray(v) ? v : []))
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [form.customer_id]);

  /**
   * Função para alterar a data do agendamento
   * Valida se a data selecionada não é fim de semana
   * @param value - Data em formato string (YYYY-MM-DD)
   */
  const handleDateChange = (value: string) => {
    if (value && isWeekend(value)) {
      setError("Por favor, selecione um dia de semana (segunda a sexta-feira).");
      return;
    }
    setForm((f) => ({ ...f, appointment_date: value }));
    setError(null);
  };

  /**
   * Função para alterar o serviço selecionado
   * Atualiza automaticamente o orçamento estimado com base no preço do serviço
   * @param serviceId - ID do serviço selecionado
   */
  const handleServiceChange = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    setForm((f) => ({ 
      ...f, 
      service_id: serviceId, 
      estimated_budget: service?.price ?? 0 
    }));
  };

  /**
   * Função para avançar para o próximo passo do formulário
   * Valida os campos obrigatórios de cada passo antes de avançar
   */
  const goToNextStep = () => {
    setError(null);

    if (currentStep === 1) {
      if (!form.customer_id) return setError("Selecione um cliente.");
      if (!form.service_id) return setError("Selecione um serviço.");
      if (!form.appointment_date) return setError("Escolha a data.");
      if (!form.appointment_time) return setError("Escolha o horário.");
    }

    if (currentStep === 2) {
      if (!form.vehicle_id) return setError("Selecione um veículo.");
      if (!form.description || form.description.trim().length < 4) {
        return setError("Descreva o serviço (mín. 4 caracteres).");
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  /**
   * Função para voltar ao passo anterior do formulário
   * Limpa mensagens de erro ao voltar
   */
  const goToPreviousStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /**
   * Função para submeter o formulário e criar a ordem de serviço
   * Valida todos os campos obrigatórios antes de enviar
   * Chama callbacks de sucesso e fecho após criação bem-sucedida
   */
  const handleSubmit = async () => {
    setError(null);

    if (!form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time || !form.vehicle_id) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    setSubmitting(true);
    try {
      const payload: CreateAppointmentPayload = {
        customer_id: form.customer_id,
        vehicle_id: form.vehicle_id,
        service_id: form.service_id,
        appointment_date: `${form.appointment_date}T${form.appointment_time}`,
        description: form.description,
        estimated_budget: form.estimated_budget || 0,
      };

      await createAppointment(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao criar ordem"));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Função para fechar o modal
   * Reset do passo atual e erro ao fechar
   */
  const handleClose = () => {
    setCurrentStep(1);
    setError(null);
    onClose();
  };

  /**
   * Cliente atualmente selecionado no formulário
   * Tipo: Customer | undefined
   */
  const selectedCustomer = customers.find((c) => c.id === form.customer_id);

  /**
   * Veículo atualmente selecionado no formulário
   * Tipo: Vehicle | undefined
   */
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);

  /**
   * Serviço atualmente selecionado no formulário
   * Tipo: Service | undefined
   */
  const selectedService = services.find((s) => s.id === form.service_id);

  return {
    /**
     * Passo atual do formulário
     */
    currentStep,

    /**
     * Estado de carregamento de dados
     */
    loadingData,

    /**
     * Estado de submissão do formulário
     */
    submitting,

    /**
     * Lista de clientes disponíveis
     */
    customers,

    /**
     * Lista de serviços disponíveis
     */
    services,

    /**
     * Lista de veículos do cliente selecionado
     */
    vehicles,

    /**
     * Mensagem de erro, se houver
     */
    error,

    /**
     * Dados do formulário
     */
    form,

    /**
     * Array com horários disponíveis para agendamento
     */
    availableTimes: AVAILABLE_TIMES,
    
    /**
     * Dados do cliente selecionado
     */
    selectedCustomer,

    /**
     * Dados do veículo selecionado
     */
    selectedVehicle,

    /**
     * Dados do serviço selecionado
     */
    selectedService,
    
    /**
     * Função para atualizar o formulário
     */
    setForm,

    /**
     * Função para alterar a data do agendamento
     */
    handleDateChange,

    /**
     * Função para alterar o serviço selecionado
     */
    handleServiceChange,

    /**
     * Função para avançar para o próximo passo
     */
    goToNextStep,

    /**
     * Função para voltar ao passo anterior
     */
    goToPreviousStep,

    /**
     * Função para submeter o formulário
     */
    handleSubmit,

    /**
     * Função para fechar o modal
     */
    handleClose,
  };
};