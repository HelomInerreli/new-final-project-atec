import axios from 'axios';
import type { Customer, CustomerCreate, CustomerUpdate, CustomerRegister } from '../interfaces/Customer';
import http from "../api/http";

const API_URL = "/customers/";


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

  register: async (customerData: CustomerRegister): Promise<Customer> => {
    const response = await axios.post('http://localhost:8000/api/v1/customersauth/register', customerData);
    return response.data;
  },

  resetPassword: async (id: string): Promise<void> => {
    await axios.post(`http://localhost:8000/api/v1/customersauth/reset-password/${id}`);
  },
};
