export interface Appointment {
  id: number;
  appointment_date: string;
  description: string;
  estimated_budget: number;
  actual_budget: number;
  reminder_sent: number;
  vehicle_id: number;
  customer_id: number;
  service_id: number;
  status_id: number;
  
  // Related objects from API response
  status?: {
    id: number;
    name: string;
  };
  
  service?: {
    id: number;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
  };
  
  // Optional flat fields that might come from API
  service_name?: string;
  service_price?: number;
  customer_name?: string;
  vehicle_info?: string;
  extra_services?: any[];
}