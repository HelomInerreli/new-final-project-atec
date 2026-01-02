import type { Vehicle, VehicleCreate, VehicleUpdate, VehicleAPIData } from '../interfaces/vehicle';
import http from "../api/http";

/**
 * Serviço para gestão de veículos
 * Fornece métodos CRUD completos para operações com veículos de clientes
 * Utiliza instância Axios configurada com autenticação
 */
export const vehicleService = {
    /**
     * Busca todos os veículos ativos de um cliente específico
     * Inclui logs de console para debug e tratamento de erros
     * @param customerId - ID numérico do cliente
     * @returns Promise com array de objetos Vehicle (apenas veículos ativos)
     * @throws Error com mensagem detalhada se falhar a requisição
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
     * Busca um veículo específico por ID
     * Inclui logs de console para debug e tratamento de erros
     * @param vehicleId - ID numérico do veículo
     * @returns Promise com objeto Vehicle
     * @throws Error com mensagem detalhada se veículo não for encontrado ou falhar a requisição
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
     * Cria um novo veículo no sistema
     * Inclui logs de console para debug e tratamento de erros
     * @param vehicleData - Dados do veículo a criar (marca, modelo, matrícula, quilómetros, cliente)
     * @returns Promise com objeto Vehicle criado
     * @throws Error com mensagem detalhada se validação falhar ou houver erro na criação
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
     * Atualiza dados de um veículo existente
     * Inclui logs de console para debug e tratamento de erros
     * @param vehicleId - ID numérico do veículo a atualizar
     * @param vehicleData - Dados parciais do veículo a atualizar (campos opcionais)
     * @returns Promise com objeto Vehicle atualizado
     * @throws Error com mensagem detalhada se veículo não for encontrado ou falhar a atualização
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
     * Remove um veículo do sistema (soft delete)
     * Veículo é marcado como inativo mas não é eliminado fisicamente da base de dados
     * Inclui logs de console para debug e tratamento de erros
     * @param vehicleId - ID numérico do veículo a remover
     * @returns Promise void
     * @throws Error com mensagem detalhada se veículo não for encontrado ou falhar a remoção
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
     * Atualiza apenas a quilometragem de um veículo
     * Utiliza PATCH para atualização parcial eficiente
     * Inclui logs de console para debug e tratamento de erros
     * @param vehicleId - ID numérico do veículo
     * @param kilometers - Nova quilometragem do veículo
     * @returns Promise com objeto Vehicle atualizado
     * @throws Error com mensagem detalhada se veículo não for encontrado ou falhar a atualização
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

