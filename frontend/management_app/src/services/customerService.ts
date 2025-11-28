import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/customers/';

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
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await axios.get(`${API_URL}${id}`);
    return response.data;
  },

  create: async (customer: CustomerCreate): Promise<Customer> => {
    const response = await axios.post(API_URL, customer);
    return response.data;
  },

  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    const response = await axios.put(`${API_URL}${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${id}`);
  },
};
