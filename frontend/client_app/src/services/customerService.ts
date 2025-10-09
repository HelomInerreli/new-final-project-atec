import http from "../api/http";
import type { Customer } from "../interfaces/customer";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await http.get<Customer[]>("/customers");
  return data;
};

export const getCustomerAppointments = async (customerId = 2) => {
  try {
    console.log("Chamando API de agendamentos para cliente:", customerId);
    // Corrigir a URL para incluir o customer_id
    const response = await http.get(`/customers/${customerId}/appointments`);
    console.log("Resposta da API:", response);
    return response.data;
  } catch (error) {
    console.error("Erro na API:", error);
    throw error;
  }
};


// Buscar serviços disponíveis
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

// Criar appointment
export const createAppointment = async (appointmentData: any) => {
  try {
    console.log("Criando appointment:", appointmentData);
    const response = await http.post("/appointments", appointmentData);
    console.log("Appointment criado:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar appointment:", error);
    throw error;
  }
};