import axios from "axios";
import type { Vehicle, VehicleCreate, VehicleUpdate } from '../interfaces/Vehicle';

const API_URL = "http://localhost:8000/api/v1/vehicles/";



export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await axios.get(`${API_URL}${id}`);
    return response.data;
  },

  getByCustomerId: async (customerId: number): Promise<Vehicle[]> => {
    const response = await axios.get(
      `http://localhost:8000/api/v1/vehicles/by_customer/${customerId}`
    );
    return response.data;
  },

  create: async (vehicle: VehicleCreate): Promise<Vehicle> => {
    const response = await axios.post(API_URL, vehicle);
    return response.data;
  },

  update: async (id: number, vehicle: VehicleUpdate): Promise<Vehicle> => {
    const response = await axios.put(`${API_URL}${id}`, vehicle);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${id}`);
  },
};
