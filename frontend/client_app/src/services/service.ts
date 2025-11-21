import http from '../api/http';
import type { Service } from '../interfaces/service';
import type { CreateAppointmentData } from '../interfaces/appointment';

export const serviceService = {
    async getAll(): Promise<Service[]> {
        const response = await http.get('/services');
        return response.data;
    }
};

export const appointmentService = {
    async create(appointmentData: CreateAppointmentData) {
        const response = await http.post("/appointments", appointmentData);
        return response.data;
    }
};