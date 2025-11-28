export interface Appointment {
  service_name: string | undefined;
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

  extra_service_associations?: ExtraService[];
}

export interface ExtraService {
  id: number;
  appointment_id: number;
  extra_service_id: number;
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface AppointmentForm {
  appointment_date: string;
  description: string;
  estimated_budget: number;
  vehicle_id: number;
  service_id: number;
}

export interface CreateAppointmentData extends AppointmentForm {
  customer_id: number;
}


export interface UpdateAppointmentData {
  appointment_date?: string;
  description?: string;
  estimated_budget?: number;
  actual_budget?: number;
  vehicle_id?: number;
  service_id?: number;
  status_id?: number;
}


export interface CreateAppointmentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface AppointmentStatusModalProps {  // ← Renomeado de AppointmentStatusModal
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
