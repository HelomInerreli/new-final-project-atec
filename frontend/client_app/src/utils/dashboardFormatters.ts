import type { Appointment } from '../interfaces/appointment';

/**
 * Formata uma data ISO para o formato pt-PT com data e hora
 * Exemplo: "28/12/2025, 14:30"
 * 
 * @param dateString - String de data no formato ISO ou compatível
 * @returns String formatada em pt-PT
 */
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formata apenas a data (sem hora) para o formato pt-PT
 * Exemplo: "28/12/2025"
 * 
 * @param dateString - String de data no formato ISO ou compatível
 * @returns String formatada em pt-PT (apenas data)
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formata apenas a hora para o formato pt-PT
 * Exemplo: "14:30"
 * 
 * @param dateString - String de data no formato ISO ou compatível
 * @returns String formatada em pt-PT (apenas hora)
 */
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formata o texto do próximo agendamento
 * Retorna a data e hora formatada ou uma mensagem indicando ausência de agendamentos
 * 
 * @param appointment - Objeto Appointment ou null
 * @param fallbackMessage - Mensagem a exibir quando não há agendamento (default: 'Nenhum agendamento')
 * @returns String formatada com data/hora ou mensagem de fallback
 */
export function formatNextAppointment(
    appointment: Appointment | null,
    fallbackMessage: string = 'Nenhum agendamento'
): string {
    if (!appointment) {
        return fallbackMessage;
    }
    
    return formatDateTime(appointment.appointment_date);
}

/**
 * Formata informações do veículo em uma string legível
 * Exemplo: "Toyota Corolla (AB-12-CD)"
 * 
 * @param vehicle - Objeto com informações do veículo
 * @returns String formatada com marca, modelo e matrícula
 */
export function formatVehicleInfo(vehicle?: {
    brand: string;
    model: string;
    plate: string;
}): string {
    if (!vehicle) {
        return '—';
    }
    
    return `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`;
}

/**
 * Formata o nome do serviço ou retorna um placeholder
 * 
 * @param service - Objeto com informações do serviço
 * @returns Nome do serviço ou '—'
 */
export function formatServiceName(service?: { name: string }): string {
    return service?.name || '—';
}

/**
 * Gera descrição textual para contagem de itens
 * Exemplo: para vehicles=3, retorna "3 veículos ativos" ou "1 veículo ativo"
 * 
 * @param count - Número de itens
 * @param singularText - Texto no singular (ex: 'veículo ativo')
 * @param pluralText - Texto no plural (ex: 'veículos ativos')
 * @returns String formatada com número e texto adequado
 */
export function formatCountDescription(
    count: number,
    singularText: string,
    pluralText: string
): string {
    return count === 1 ? singularText : pluralText;
}
