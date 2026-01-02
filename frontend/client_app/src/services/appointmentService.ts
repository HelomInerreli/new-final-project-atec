import { type CreateAppointmentData, type AppointmentForm } from '../interfaces/appointment';
import { type Vehicle } from '../interfaces/vehicle';
import { createAppointment as createAppointmentAPI } from './customerService';

/**
 * Submete um novo agendamento para a API
 * Delega a criação para a API de customerService
 * @param data - Dados do agendamento a ser criado (data, veículo, serviço, descrição)
 * @returns Promise void - Resolve quando agendamento é criado com sucesso
 * @throws Erro HTTP se falhar a criação do agendamento
 */
export async function submitAppointment(data: CreateAppointmentData): Promise<void> {
    return createAppointmentAPI(data);
}

/**
 * Valida os dados do formulário de agendamento
 * Verifica se todos os campos obrigatórios estão preenchidos e válidos
 * Validações: dados carregados, veículos disponíveis, data selecionada, veículo escolhido,
 * descrição preenchida com mínimo de 4 caracteres (após trim)
 * @param form - Objeto com dados do formulário (data, veículo, descrição)
 * @param vehicles - Array de veículos disponíveis do cliente
 * @param loadingData - Flag indicando se dados ainda estão a carregar
 * @returns true se formulário válido e pronto para submissão, false caso contrário
 */
export function validateAppointmentForm(
    form: AppointmentForm,
    vehicles: Vehicle[],
    loadingData: boolean
): boolean {
    return !!(
        !loadingData &&
        vehicles.length > 0 &&
        form.appointment_date &&
        form.vehicle_id &&
        form.description &&
        form.description.trim().length > 3  
    );
}

