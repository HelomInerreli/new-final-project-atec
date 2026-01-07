// Interface para props do modal de criar ordem de serviço
export interface CreateServiceOrderModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

// Interface para formulário de ordem de serviço
export interface ServiceOrderForm {
  customer_id: number;
  vehicle_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  description: string;
  estimated_budget: number;
}