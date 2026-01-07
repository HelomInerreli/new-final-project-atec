import axios from "axios";
import type { Vehicle, VehicleCreate, VehicleUpdate } from '../interfaces/Vehicle';

// const API_URL = "http://localhost:8000/api/v1/vehicles/";
import http from "../api/http";

const API_URL = "/vehicles/";



// Serviço para gerenciar veículos
export const vehicleService = {
  // Obter todos os veículos
  getAll: async (): Promise<Vehicle[]> => {
    const response = await http.get(API_URL);
    return response.data;
  },

  // Obter veículo por ID
  getById: async (id: number): Promise<Vehicle> => {
    const response = await http.get(`${API_URL}${id}`);
    return response.data;
  },

  // Obter veículos por ID do cliente
  getByCustomerId: async (customerId: number): Promise<Vehicle[]> => {
    const response = await http.get(`/vehicles/by_customer/${customerId}`);
    return response.data;
  },

  // Criar novo veículo
  create: async (vehicle: VehicleCreate): Promise<Vehicle> => {
    const response = await http.post(API_URL, vehicle);
    return response.data;
  },

  // Atualizar veículo
  update: async (id: number, vehicle: VehicleUpdate): Promise<Vehicle> => {
    const response = await http.put(`${API_URL}${id}`, vehicle);
    return response.data;
  },

  // Deletar veículo
  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_URL}${id}`);
  },
};
