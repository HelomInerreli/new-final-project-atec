import axios from "axios";
import type { VehicleAPI } from '../interfaces/VehicleAPI';

const API_URL = "http://localhost:8000/api/v1/vehiclesapi/";



// Serviço para gerenciar veículos via API externa
export const vehicleService = {
  // Obter veículo por placa
  getByPlate: async (plate: string): Promise<VehicleAPI> => {
    const response = await axios.get(`${API_URL}${plate}`);
    return response.data;
  },
}