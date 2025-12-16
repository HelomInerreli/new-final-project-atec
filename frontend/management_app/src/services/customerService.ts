import http from "../api/http";

const API_URL = "/customers/";

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
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

export interface CustomerUpdate {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await http.get(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await http.get(`${API_URL}${id}`);
    return response.data;
  },

  create: async (customer: CustomerCreate): Promise<Customer> => {
    const response = await http.post(API_URL, customer);
    return response.data;
  },

  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    const response = await http.put(`${API_URL}${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_URL}${id}`);
  },
};
