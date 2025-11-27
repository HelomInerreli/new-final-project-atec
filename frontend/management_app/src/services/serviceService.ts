import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/services/";

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
}

export interface ServiceCreate {
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface ServiceUpdate {
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export const serviceService = {
  getAll: async (): Promise<Service[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<Service> => {
    const response = await axios.get(`${API_URL}${id}`);
    return response.data;
  },

  // Create new service
  create: async (service: ServiceCreate): Promise<Service> => {
    const response = await axios.post(API_URL, service);
    return response.data;
  },

  // Update service
  update: async (id: number, service: ServiceUpdate): Promise<Service> => {
    const response = await axios.put(`${API_URL}${id}`, service);
    return response.data;
  },

  // Delete service
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${id}`);
  },
};
