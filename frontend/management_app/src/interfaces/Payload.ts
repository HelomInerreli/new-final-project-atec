// Interface para payload de criação de agendamento
export interface CreateAppointmentPayload {
  customer_id: number;
  vehicle_id: number;
  service_id: number;
  appointment_date: string;
  description: string;
  estimated_budget: number;
}