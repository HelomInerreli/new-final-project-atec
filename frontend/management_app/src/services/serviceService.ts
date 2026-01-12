import http from "../api/http";

const API_URL = "/services/";

// Interface para Serviço
export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
  area?: string;
}

// Interface para criação de serviço
export interface ServiceCreate {
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active?: boolean;
  area?: string;
}

// Interface para atualização de serviço
export interface ServiceUpdate {
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  is_active?: boolean;
  area?: string;
}

// Serviço para gerenciar serviços
export const serviceService = {
  // Obter todos os serviços
  getAll: async (): Promise<Service[]> => {
    const response = await http.get(API_URL);
    return response.data;
  },

  // Obter serviço por ID
  getById: async (id: number): Promise<Service> => {
    const response = await http.get(`${API_URL}${id}`);
    return response.data;
  },

  // Criar novo serviço
  create: async (service: ServiceCreate): Promise<Service> => {
    const response = await http.post(API_URL, service);
    return response.data;
  },

  // Atualizar serviço
  update: async (id: number, service: ServiceUpdate): Promise<Service> => {
    const response = await http.put(`${API_URL}${id}`, service);
    return response.data;
  },

  // Deletar serviço
  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_URL}${id}`);
  },
};
