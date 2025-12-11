import axios from 'axios';
import type { Customer, CustomerCreate, CustomerUpdate, CustomerRegister } from '../interfaces/Customer';

const API_URL = 'http://localhost:8000/api/v1/customers/';


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

  register: async (customerData: CustomerRegister): Promise<Customer> => {
    const response = await axios.post('http://localhost:8000/api/v1/customersauth/register', customerData);
    return response.data;
  },

  resetPassword: async (id: string): Promise<void> => {
    await axios.post(`http://localhost:8000/api/v1/customersauth/reset-password/${id}`);
  },
};
