
import type { Appointment } from '../interfaces/appointment';
import http from '../api/http';  // ← Use o Axios configurado

export async function fetchAppointmentById(id: number): Promise<Appointment> {
  const response = await http.get(`/appointments/${id}`);  // ← Use http.get (Axios já tem baseURL e auth)
  return response.data;
}