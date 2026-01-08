import http from '../api/http';
import type { Appointment } from '../interfaces/appointment';
import { getCustomerIdFromToken, getStoredToken } from '../api/auth';

/**
 * Busca todos os agendamentos (histórico de serviços)
 * Utiliza instância Axios configurada com baseURL e autenticação
 * Nota: Nome da função mantido como "getServices" por compatibilidade, mas retorna Appointments
 * @returns Promise com array de objetos Appointment contendo histórico de todos os agendamentos
 * @throws Erro HTTP se falhar a requisição
 */
export const getServices = async (): Promise<Appointment[]> => {
    const token = await getStoredToken();
    if (!token) {
        throw new Error('No stored token found');
    }
    const customerId = getCustomerIdFromToken(token);
    if (!customerId) {
        throw new Error('Invalid token: customer ID not found');
    }
    const response = await http.get(`/customers/${customerId}/appointments`);
  return response.data;
};