import http from "../api/http";
import type { Appointment } from "../interfaces/Appointment";
import type { Customer } from "../interfaces/Customer";

export const getAppointments = async (params?: {
  status?: string;
  q?: string;
  page?: number;
  customerId?: number;
}): Promise<Appointment[]> => {
  try {
    const res = await http.get<Appointment[]>("/appointments", {
      params,
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("getAppointments error:", err);
    throw err;
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await http.get<Customer[]>("/customers");
  return data;
};

export const getServices = async () => {
  try {
    console.log("Buscando serviços disponíveis...");
    const response = await http.get("/services");
    console.log("Serviços recebidos:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    throw error;
  }
};

// Buscar veículos do cliente
export const getCustomerVehicles = async (customerId: number) => {
  try {
    console.log("Buscando veículos do cliente:", customerId);
    const response = await http.get(`/vehicles/by_customer/${customerId}`);
    console.log("Veículos recebidos:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    throw error;
  }
};

export const getCustomerAppointments = async (customerId: number) => {
  if (!customerId) throw new Error("customerId is required");
  try {
    console.log("Chamando API de agendamentos para cliente:", customerId);
    const response = await http.get(`/customers/${customerId}/appointments`, { withCredentials: true });
    console.log("Resposta da API:", response);
    return response.data;
  } catch (error) {
    console.error("Erro na API:", error);
    throw error;
  }
};


export const getAppointmentById = async (id: number): Promise<Appointment> => {
  try {
    const res = await http.get<Appointment>(`/appointments/${id}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("getAppointmentById error:", err);
    throw err;
  }
};

export const createAppointment = async (appointment: Appointment): Promise<Appointment> => {
  try {
    const res = await http.post<Appointment>("/appointments", appointment, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("createAppointment error:", err);
    throw err;
  }
};

export const updateAppointment = async (id: number, appointment: Appointment): Promise<Appointment> => {
  try {
    const res = await http.put<Appointment>(`/appointments/${id}`, appointment, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("updateAppointment error:", err);
    throw err;
  }
};

export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await http.delete(`/appointments/${id}`, { withCredentials: true });
  } catch (err) {
    console.error("deleteAppointment error:", err);
    throw err;
  }
};

export default {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};