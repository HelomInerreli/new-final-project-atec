import http from '../api/http';
import type { Appointment } from '../interfaces/appointment';

/**
 * Busca todos os agendamentos (histórico de serviços)
 * Utiliza instância Axios configurada com baseURL e autenticação
 * Nota: Nome da função mantido como "getServices" por compatibilidade, mas retorna Appointments
 * @returns Promise com array de objetos Appointment contendo histórico de todos os agendamentos
 * @throws Erro HTTP se falhar a requisição
 */
export const getServices = async (): Promise<Appointment[]> => {
  const response = await http.get('/appointments'); 
  return response.data;
};