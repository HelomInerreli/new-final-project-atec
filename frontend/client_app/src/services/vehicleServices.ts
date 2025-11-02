import type { Vehicle, VehicleCreate, VehicleUpdate } from '../interfaces/vehicle';
import http from "../api/http";

export const vehicleService = {
    /**
     * Buscar todos os veículos de um cliente (apenas ativos)
     */
    async getByCustomer(customerId: number): Promise<Vehicle[]> {
        const response = await http.get(`/vehicles/by_customer/${customerId}`);
        // Filtrar apenas veículos que NÃO foram deletados (deleted_at é null/undefined)
        const vehicles = response.data as Vehicle[];
        return vehicles.filter(vehicle => 
            vehicle.deleted_at === null || 
            vehicle.deleted_at === undefined || 
            vehicle.deleted_at === ''
        );
    },

    /**
     * Buscar um veículo por ID
     */
    async getById(vehicleId: number): Promise<Vehicle> {
        const response = await http.get(`/vehicles/${vehicleId}`);
        return response.data;
    },

    /**
     * Criar um novo veículo
     */
    async create(vehicleData: VehicleCreate): Promise<Vehicle> {
        const response = await http.post('/vehicles/', vehicleData);
        return response.data;
    },

    /**
     * Atualizar um veículo existente
     */
    async update(vehicleId: number, vehicleData: VehicleUpdate): Promise<Vehicle> {
        const response = await http.put(`/vehicles/${vehicleId}`, vehicleData);
        return response.data;
    },

    /**
     * Deletar um veículo (soft delete)
     */
    async delete(vehicleId: number): Promise<void> {
        await http.delete(`/vehicles/${vehicleId}`);
    },

    /**
     * Atualizar apenas os quilômetros de um veículo
     */
    async updateKilometers(vehicleId: number, kilometers: number): Promise<Vehicle> {
        return this.update(vehicleId, { kilometers });
    },
};

