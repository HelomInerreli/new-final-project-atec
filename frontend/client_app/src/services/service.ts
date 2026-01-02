import http from '../api/http';
import type { Service } from '../interfaces/service';
import type { CreateAppointmentData } from '../interfaces/appointment';

/**
 * Serviço para gestão de serviços disponíveis
 * Fornece métodos para listar serviços que podem ser agendados
 */
export const serviceService = {
    /**
     * Busca todos os serviços disponíveis
     * @returns Promise com array de objetos Service
     * @throws Erro HTTP se falhar a requisição
     */
    async getAll(): Promise<Service[]> {
        const response = await http.get('/services');
        return response.data;
    }
};

/**
 * Serviço para gestão de agendamentos
 * Fornece métodos para criar e manipular agendamentos
 */
export const appointmentService = {
    /**
     * Cria um novo agendamento
     * @param appointmentData - Dados do agendamento (data, veículo, serviço, descrição, cliente)
     * @returns Promise com dados do agendamento criado
     * @throws Erro HTTP se validação falhar ou houver erro na criação
     */
    async create(appointmentData: CreateAppointmentData) {
        const response = await http.post("/appointments", appointmentData);
        return response.data;
    }
};