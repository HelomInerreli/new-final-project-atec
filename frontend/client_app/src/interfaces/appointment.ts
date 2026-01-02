/**
 * Interface principal para representação de um agendamento completo
 * Contém dados básicos do agendamento e objetos relacionados (serviço, veículo, status)
 * Utilizada para exibir detalhes completos de agendamentos na aplicação cliente
 */
export interface Appointment {
  /** Nome do serviço (alternativo a service.name) */
  service_name: string | undefined;
  /** Data do agendamento (alternativo a appointment_date) */
  date: string;
  /** ID único do agendamento */
  id: number;
  /** Data e hora do agendamento no formato ISO */
  appointment_date: string;
  /** Descrição adicional ou observações do agendamento (opcional) */
  description?: string;
  /** Orçamento estimado inicial em valor monetário */
  estimated_budget: number;
  /** Orçamento real/final após conclusão do serviço (opcional) */
  actual_budget?: number;
  /** ID do cliente proprietário do agendamento */
  customer_id: number;
  /** ID do veículo associado ao agendamento */
  vehicle_id: number;
  /** ID do serviço principal do agendamento */
  service_id: number;
  /** ID do status atual do agendamento */
  status_id: number;

  /**
   * Objeto completo do serviço principal (populated pela API)
   * Inclui detalhes como nome, descrição e preço
   */
  service?: {
    id: number;
    name: string;
    description?: string;
    price: number;
  };

  /**
   * Objeto completo do veículo (populated pela API)
   * Inclui marca, modelo e matrícula
   */
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    plate: string;
  };

  /**
   * Objeto completo do status (populated pela API)
   * Indica estado atual do agendamento
   */
  status?: {
    id: number;
    name: string;
  };

  /**
   * Array de serviços extra associados ao agendamento
   * Serviços adicionais podem ser adicionados ao agendamento principal
   */
  extra_service_associations?: ExtraService[];
}

/**
 * Interface para representação de serviço extra/adicional vinculado a um agendamento
 * Serviços extras podem ser adicionados ao agendamento principal e requerem aprovação
 * Estados: pending (pendente), approved (aprovado), rejected (rejeitado)
 */
export interface ExtraService {
  /** ID único do serviço extra */
  id: number;
  /** ID do agendamento ao qual o serviço extra está associado */
  appointment_id: number;
  /** ID do tipo de serviço extra (referência à tabela de serviços extras) */
  extra_service_id: number;
  /** Nome do serviço extra (opcional, populated pela API) */
  name?: string;
  /** Descrição detalhada do serviço extra (opcional) */
  description?: string;
  /** Preço do serviço extra (opcional) */
  price?: number;
  /** Duração estimada do serviço em minutos (opcional) */
  duration_minutes?: number;
  /** Status da aprovação do serviço extra pelo cliente */
  status: 'pending' | 'approved' | 'rejected';
  /** Data de criação do registro (opcional, formato ISO) */
  created_at?: string;
}

/**
 * Interface para dados do formulário de criação de agendamento
 * Representa campos obrigatórios que o utilizador deve preencher no formulário
 * Não inclui customer_id pois é obtido automaticamente do utilizador autenticado
 */
export interface AppointmentForm {
  /** Data e hora do agendamento no formato ISO */
  appointment_date: string;
  /** Descrição ou observações sobre o agendamento */
  description: string;
  /** Orçamento estimado para o serviço */
  estimated_budget: number;
  /** ID do veículo selecionado para o agendamento */
  vehicle_id: number;
  /** ID do serviço selecionado */
  service_id: number;
}

/**
 * Interface para dados completos de criação de agendamento enviados à API
 * Estende AppointmentForm adicionando customer_id obtido do contexto de autenticação
 */
export interface CreateAppointmentData extends AppointmentForm {
  /** ID do cliente que está criando o agendamento */
  customer_id: number;
}

/**
 * Interface para dados de atualização parcial de agendamento
 * Todos os campos são opcionais - apenas campos fornecidos serão atualizados
 * Utilizada em operações PATCH para modificar agendamentos existentes
 */
export interface UpdateAppointmentData {
  /** Nova data/hora do agendamento (opcional) */
  appointment_date?: string;
  /** Nova descrição (opcional) */
  description?: string;
  /** Novo orçamento estimado (opcional) */
  estimated_budget?: number;
  /** Orçamento real/final (opcional) */
  actual_budget?: number;
  /** Novo veículo associado (opcional) */
  vehicle_id?: number;
  /** Novo serviço principal (opcional) */
  service_id?: number;
  /** Novo status (opcional) */
  status_id?: number;
}

/**
 * Props para componente modal de criação de agendamento
 * Controla visibilidade, fechamento e callback de sucesso após criação
 */
export interface CreateAppointmentModalProps {
  /** Flag de controle de visibilidade do modal */
  show: boolean;
  /** Callback executado ao fechar o modal */
  onClose: () => void;
  /** Callback executado após criação bem-sucedida do agendamento */
  onSuccess: () => void;
}

/**
 * Props para componente modal de visualização de status de agendamento
 * Exibe detalhes completos do agendamento incluindo status e serviços extras
 */
export interface AppointmentStatusModalProps {  
  /** Agendamento a ser exibido (null se modal fechado) */
  appointment: Appointment | null;
  /** Estado de abertura do modal */
  open: boolean;
  /** Callback para alterar estado de abertura do modal */
  onOpenChange: (open: boolean) => void;
}
