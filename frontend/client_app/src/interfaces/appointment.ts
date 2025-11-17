export interface Appointment {
  date: string;
  id: number;
  appointment_date: string;
  description?: string;
  estimated_budget: number;
  actual_budget?: number;
  customer_id: number;
  vehicle_id: number;
  service_id: number;
  status_id: number;
  
  // Related objects from API response
  service?: {
    id: number;
    name: string;
    description?: string;
    price: number;
  };
  
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    plate: string;
  };
  
  status?: {
    id: number;
    name: string;
  };
}