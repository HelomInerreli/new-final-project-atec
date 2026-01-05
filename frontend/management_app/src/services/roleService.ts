import http from '../api/http'; // Assumindo que tem um http client configurado
import type { Role } from '../interfaces/Role';

export const roleService = {
    /**
     * Busca todas as funções (cargos) da API.
     */
    getAll: async (): Promise<Role[]> => {
        try {
            const response = await http.get<Role[]>('/roles');
            return response.data;
        } catch (error) {
            console.error('Falha ao buscar as funções:', error);
            throw new Error('Não foi possível carregar as funções.');
        }
    },
};