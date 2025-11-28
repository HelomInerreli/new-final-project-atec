import http from '../api/http';

const API_URL = '/statuses/';

export interface Status {
    id: number;
    name: string;
}

export const statusService = {
    getAll: async (): Promise<Status[]> => {
        const response = await http.get(API_URL);
        return response.data;
    },
};
