export interface CreateServiceOrderModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export interface ServiceOrderForm {
  customer_id: number;
  vehicle_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  description: string;
  estimated_budget: number;
}