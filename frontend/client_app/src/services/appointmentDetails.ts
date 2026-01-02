
import type { Appointment } from '../interfaces/appointment';
import http from '../api/http';

/**
 * Busca detalhes de um agendamento específico por ID
 * Utiliza instância Axios configurada com baseURL e autenticação
 * @param id - ID numérico do agendamento a ser consultado
 * @returns Promise com objeto Appointment contendo todos os detalhes do agendamento
 * @throws Erro HTTP se agendamento não for encontrado ou houver falha na requisição
 */
export async function fetchAppointmentById(id: number): Promise<Appointment> {
  const response = await http.get(`/appointments/${id}`);
  return response.data;
}