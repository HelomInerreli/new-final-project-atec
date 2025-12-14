import axios from "axios";
import type { Vehicle} from '../interfaces/VehicleAPI';

const API_URL = "http://localhost:8000/api/v1/vehiclesapi/";



export const vehicleService = {
  getByPlate: async (plate: string): Promise<Vehicle> => {
    const response = await axios.get(`${API_URL}${plate}`);
    return response.data;
  },
}