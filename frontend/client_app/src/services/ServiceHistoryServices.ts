import http from '../api/http';
import type { Appointment } from '../interfaces/appointment'; // Changed from Service to Appointment

export const getServices = async (): Promise<Appointment[]> => { // Changed return type
  const response = await http.get('/appointments'); 
  return response.data;
};