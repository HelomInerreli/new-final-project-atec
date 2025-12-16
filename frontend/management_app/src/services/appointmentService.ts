import http from "../api/http";

const API_URL = "/appointments/";

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  customer_id: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
}

export interface Status {
  id: number;
  name: string;
  description?: string;
}

export interface Appointment {
  id: number;
  appointment_date: string;
  description: string;
  estimated_budget: number;
  actual_budget: number;
  customer_id?: number;
  vehicle_id?: number;
  service_id?: number;
  status_id?: number;
  customer?: Customer;
  vehicle?: Vehicle;
  service?: Service;
  status?: Status;
  service_name?: string;
  service_price?: number;
}

export interface AppointmentCreate {
  appointment_date: string;
  description: string;
  estimated_budget: number;
  actual_budget: number;
  vehicle_id: number;
  customer_id: number;
  service_id: number;
}

export interface AppointmentUpdate {
  appointment_date?: string;
  description?: string;
  vehicle_id?: number;
  service_id?: number;
  status_id?: number;
  estimated_budget?: number;
  actual_budget?: number;
}

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await http.get(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await http.get(`${API_URL}${id}`);
    return response.data;
  },

  create: async (appointment: AppointmentCreate): Promise<Appointment> => {
    const response = await http.post(API_URL, appointment);
    return response.data;
  },

  update: async (
    id: number,
    appointment: AppointmentUpdate
  ): Promise<Appointment> => {
    const response = await http.put(`${API_URL}${id}`, appointment);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_URL}${id}`);
  },

  cancel: async (id: number): Promise<Appointment> => {
    const response = await http.patch(`${API_URL}${id}/cancel`);
    return response.data;
  },

  finalize: async (id: number): Promise<Appointment> => {
    const response = await http.patch(`${API_URL}${id}/finalize`);
    return response.data;
  },
};
