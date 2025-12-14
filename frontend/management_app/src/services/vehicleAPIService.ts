import axios from "axios";
import type { VehicleAPI } from '../interfaces/VehicleAPI';

const API_URL = "http://localhost:8000/api/v1/vehiclesapi/";



export const vehicleService = {
  getByPlate: async (plate: string): Promise<VehicleAPI> => {
    const response = await axios.get(`${API_URL}${plate}`);
    return response.data;
  },
}