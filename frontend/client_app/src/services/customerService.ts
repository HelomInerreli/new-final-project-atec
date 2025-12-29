import http from "../api/http";
import type { Customer } from "../interfaces/customer";

/**
 * Busca lista de todos os clientes
 * Utiliza instância Axios configurada com autenticação
 * @returns Promise com array de objetos Customer
 * @throws Erro HTTP se falhar a requisição
 */
export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await http.get<Customer[]>("/customers");
  return data;
};

/**
 * Busca agendamentos de um cliente específico
 * Inclui logs de console para debug
 * @param customerId - ID do cliente (padrão: 2)
 * @returns Promise com array de agendamentos do cliente
 * @throws Erro HTTP se cliente não for encontrado ou falhar a requisição
 */
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

/**
 * Busca lista de serviços disponíveis para agendamento
 * Inclui logs de console para debug
 * @returns Promise com array de serviços disponíveis
 * @throws Erro HTTP se falhar a requisição
 */
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

/**
 * Busca veículos associados a um cliente específico
 * Inclui logs de console para debug
 * @param customerId - ID numérico do cliente
 * @returns Promise com array de veículos do cliente
 * @throws Erro HTTP se cliente não for encontrado ou falhar a requisição
 */
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

/**
 * Cria um novo agendamento na API
 * Inclui logs de console para debug
 * @param appointmentData - Dados do agendamento (data, veículo, serviço, descrição, cliente)
 * @returns Promise com dados do agendamento criado
 * @throws Erro HTTP se validação falhar ou houver erro na criação
 */
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