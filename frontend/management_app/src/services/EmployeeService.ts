import http from '../api/http'; // Assumindo que tem um http client configurado
import type { Employee, EmployeeCreate, EmployeeUpdate } from '../interfaces/Employee';

export const employeeService = {
    /**
     * Busca todos os funcionários da API.
     */
    getAll: async (): Promise<Employee[]> => {
        try {
            const response = await http.get<Employee[]>('/employees');
            return response.data;
        } catch (error) {
            console.error('Falha ao buscar funcionários:', error);
            throw new Error('Não foi possível carregar os funcionários.');
        }
    },

    /**
     * Cria um novo funcionário.
     */
    create: async (employeeData: EmployeeCreate): Promise<Employee> => {
        try {
            const response = await http.post<Employee>('/employees', employeeData);
            return response.data;
        } catch (error) {
            console.error('Falha ao criar funcionário:', error);
            throw new Error('Não foi possível criar o funcionário.');
        }
    },

    /**
     * Atualiza um funcionário existente.
     */
    update: async (id: number, employeeData: EmployeeUpdate): Promise<Employee> => {
        try {
            const response = await http.put<Employee>(`/employees/${id}`, employeeData);
            return response.data;
        } catch (error) {
            console.error(`Falha ao atualizar o funcionário ${id}:`, error);
            throw new Error('Não foi possível atualizar o funcionário.');
        }
    },

    /**
     * Apaga um funcionário (soft delete).
     */
    delete: async (id: number): Promise<void> => {
        try {
            await http.delete(`/employees/${id}`);
        } catch (error) {
            console.error(`Falha ao apagar o funcionário ${id}:`, error);
            throw new Error('Não foi possível apagar o funcionário.');
        }
    },
};