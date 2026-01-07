import http from '../api/http';

const API_URL = '/statuses/';

// Interface para Status
export interface Status {
    id: number;
    name: string;
}

// Serviço para gerenciar status
export const statusService = {
    // Obter todos os status
    getAll: async (): Promise<Status[]> => {
        const response = await http.get(API_URL);
        return response.data;
    },
};
