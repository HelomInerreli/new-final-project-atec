import type { Vehicle, VehicleCreate, VehicleUpdate, VehicleAPIData } from '../interfaces/vehicle';
import http from "../api/http";

export const vehicleService = {
    /**
     * Buscar todos os veículos de um cliente (apenas ativos)
     */
    async getByCustomer(customerId: number): Promise<Vehicle[]> {
        try {
            const response = await http.get(`/vehicles/by_customer/${customerId}`);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar veículos do cliente:', error);
            throw new Error(`Falha ao carregar veículos: ${error.message || 'Erro desconhecido'}`);
        }
    },

    /**
     * Buscar um veículo por ID
     */
    async getById(vehicleId: number): Promise<Vehicle> {
        try {
            const response = await http.get(`/vehicles/${vehicleId}`);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar veículo por ID:', error);
            throw new Error(`Falha ao carregar veículo: ${error.message || 'Erro desconhecido'}`);
        }
    },

    /**
     * Criar um novo veículo
     */
    async create(vehicleData: VehicleCreate): Promise<Vehicle> {
        try {
            const response = await http.post('/vehicles', vehicleData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar veículo:', error);
            throw new Error(`Falha ao criar veículo: ${error.message || 'Erro desconhecido'}`);
        }
    },

    /**
     * Atualizar um veículo existente
     */
    async update(vehicleId: number, vehicleData: VehicleUpdate): Promise<Vehicle> {
        try {
            const response = await http.put(`/vehicles/${vehicleId}`, vehicleData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao atualizar veículo:', error);
            throw new Error(`Falha ao atualizar veículo: ${error.message || 'Erro desconhecido'}`);
        }
    },

    /**
     * Deletar um veículo (soft delete)
     */
    async delete(vehicleId: number): Promise<void> {
        try {
            await http.delete(`/vehicles/${vehicleId}`);
        } catch (error: any) {
            console.error('Erro ao deletar veículo:', error);
            throw new Error(`Falha ao deletar veículo: ${error.message || 'Erro desconhecido'}`);
        }
    },

    /**
     * Atualizar apenas os quilômetros de um veículo
     */
    async updateKilometers(vehicleId: number, kilometers: number): Promise<Vehicle> {
        try {
            const response = await http.patch(`/vehicles/${vehicleId}/kilometers`, { kilometers });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao atualizar quilômetros:', error);
            throw new Error(`Falha ao atualizar quilômetros: ${error.message || 'Erro desconhecido'}`);
        }
    },

    /**
     * Buscar dados de veículo da API externa por matrícula
     */
    async getFromAPI(plate: string): Promise<VehicleAPIData> {
        try {
            const response = await http.get(`/vehiclesapi/${plate}`);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar veículo da API:', error);
            throw new Error(`Falha ao buscar da API: ${error.message || 'Erro desconhecido'}`);
        }
    },
};

