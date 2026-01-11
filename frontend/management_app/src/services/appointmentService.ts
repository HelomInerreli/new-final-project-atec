import axios from "axios";
import type { Vehicle } from "../interfaces/Vehicle";
import http from "../api/http";

const API_URL = "/appointments/";

// Interface para Cliente
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

// Interface para Serviço
export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
}

// Interface para Status
export interface Status {
  id: number;
  name: string;
  description?: string;
}

// Interface para Agendamento
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

// Interface para criação de agendamento
export interface AppointmentCreate {
  appointment_date: string;
  description: string;
  estimated_budget: number;
  actual_budget: number;
  vehicle_id: number;
  customer_id: number;
  service_id: number;
}

// Interface para atualização de agendamento
export interface AppointmentUpdate {
  appointment_date?: string;
  description?: string;
  vehicle_id?: number;
  service_id?: number;
  status_id?: number;
  estimated_budget?: number;
  actual_budget?: number;
}

// Serviço para gerenciar agendamentos
export const appointmentService = {
  // Obter todos os agendamentos
  getAll: async (): Promise<Appointment[]> => {
    const response = await http.get(API_URL);
    return response.data;
  },

  // Obter agendamento por ID
  getById: async (id: number): Promise<Appointment> => {
    const response = await http.get(`${API_URL}${id}`);
    return response.data;
  },

  // Criar novo agendamento
  create: async (appointment: AppointmentCreate): Promise<Appointment> => {
    const response = await http.post(API_URL, appointment);
    return response.data;
  },

  // Atualizar agendamento
  update: async (
    id: number,
    appointment: AppointmentUpdate
  ): Promise<Appointment> => {
    const response = await http.put(`${API_URL}${id}`, appointment);
    return response.data;
  },

  // Deletar agendamento
  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_URL}${id}`);
  },

  // Cancelar agendamento
  cancel: async (id: number): Promise<Appointment> => {
    const response = await http.patch(`${API_URL}${id}/cancel`);
    return response.data;
  },

  // Finalizar agendamento
  finalize: async (id: number): Promise<Appointment> => {
    const response = await http.patch(`${API_URL}${id}/finalize`);
    return response.data;
  },
};
