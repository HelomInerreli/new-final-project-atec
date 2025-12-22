import http from '../api/http';
import type { Absence, AbsenceRequestCreate, AbsenceType, AbsenceStatus } from '../interfaces/Absence';

export const absenceService = {
    /**
     * Busca todas as ausências com filtros opcionais.
     */
    getAll: async (employeeId?: number, statusId?: number): Promise<Absence[]> => {
        try {
            const params = new URLSearchParams();
            if (employeeId) params.append('employee_id', employeeId.toString());
            if (statusId) params.append('status_id', statusId.toString());
            
            const response = await http.get<Absence[]>(`/absences?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Falha ao buscar ausências:', error);
            throw new Error('Não foi possível carregar as ausências.');
        }
    },

    /**
     * Busca uma ausência por ID.
     */
    getById: async (id: number): Promise<Absence> => {
        try {
            const response = await http.get<Absence>(`/absences/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Falha ao buscar ausência ${id}:`, error);
            throw new Error('Não foi possível carregar a ausência.');
        }
    },

    /**
     * Cria múltiplas ausências (ex: período de férias).
     */
    createBulk: async (absenceData: AbsenceRequestCreate): Promise<Absence[]> => {
        try {
            const response = await http.post<Absence[]>('/absences/bulk', absenceData);
            return response.data;
        } catch (error) {
            console.error('Falha ao criar ausências:', error);
            throw new Error('Não foi possível criar as ausências.');
        }
    },

    /**
     * Atualiza o status de uma ausência (aprovar/rejeitar).
     */
    updateStatus: async (id: number, statusId: number): Promise<Absence> => {
        try {
            const response = await http.patch<Absence>(`/absences/${id}/status`, { status_id: statusId });
            return response.data;
        } catch (error) {
            console.error(`Falha ao atualizar status da ausência ${id}:`, error);
            throw new Error('Não foi possível atualizar o status da ausência.');
        }
    },

    /**
     * Apaga uma ausência.
     */
    delete: async (id: number): Promise<void> => {
        try {
            await http.delete(`/absences/${id}`);
        } catch (error) {
            console.error(`Falha ao apagar ausência ${id}:`, error);
            throw new Error('Não foi possível apagar a ausência.');
        }
    },

    /**
     * Busca todos os tipos de ausência (Férias, Folga).
     */
    getAbsenceTypes: async (): Promise<AbsenceType[]> => {
        try {
            const response = await http.get<AbsenceType[]>('/absence-types');
            return response.data;
        } catch (error) {
            console.error('Falha ao buscar tipos de ausência:', error);
            throw new Error('Não foi possível carregar os tipos de ausência.');
        }
    },

    /**
     * Busca todos os status de ausência (Aprovado, Pendente, Recusado).
     */
    getAbsenceStatuses: async (): Promise<AbsenceStatus[]> => {
        try {
            const response = await http.get<AbsenceStatus[]>('/absence-statuses');
            return response.data;
        } catch (error) {
            console.error('Falha ao buscar status de ausência:', error);
            throw new Error('Não foi possível carregar os status de ausência.');
        }
    },
};