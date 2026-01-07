/**
 * Hook personalizado para gerenciar funcionários.
 * Permite buscar, adicionar, atualizar e remover funcionários.
 */

import { useState, useEffect, useCallback } from 'react';
// Importa hooks do React
import { employeeService } from '../services/EmployeeService';
// Serviço para funcionários
import type { Employee, EmployeeCreate, EmployeeUpdate } from '../interfaces/Employee';
// Tipos para funcionários

/**
 * Hook para gerenciar lista de funcionários.
 * @returns Estado e funções para funcionários
 */
export function useEmployees() {
    // Estado para lista de funcionários
    const [employees, setEmployees] = useState<Employee[]>([]);
    // Estado de carregamento
    const [loading, setLoading] = useState<boolean>(true);
    // Estado de erro
    const [error, setError] = useState<string | null>(null);

    // Função para buscar funcionários
    const fetchEmployees = useCallback(async () => {
        try {
            // Inicia carregamento
            setLoading(true);
            // Busca dados
            const data = await employeeService.getAll();
            // Define funcionários
            setEmployees(data);
            // Limpa erro
            setError(null);
        } catch (err) {
            // Define erro
            setError((err as Error).message);
        } finally {
            // Finaliza carregamento
            setLoading(false);
        }
    }, []);

    // Efeito para buscar funcionários na montagem
    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Função para adicionar funcionário
    const addEmployee = async (employeeData: EmployeeCreate) => {
        try {
            // Cria funcionário
            const newEmployee = await employeeService.create(employeeData);
            // Adiciona à lista
            setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
        } catch (err) {
            // Log erro
            console.error("Failed to add employee:", err);
            // Re-lança erro
            throw err;
        }
    };

    // Função para atualizar funcionário
    const updateEmployee = async (id: number, employeeData: EmployeeUpdate) => {
        try {
            // Atualiza funcionário
            const updatedEmployee = await employeeService.update(id, employeeData);
            // Atualiza na lista
            setEmployees((prevEmployees) =>
                prevEmployees.map((emp) => (emp.id === id ? updatedEmployee : emp))
            );
        } catch (err) {
            // Log erro
            console.error("Failed to update employee:", err);
            // Re-lança erro
            throw err;
        }
    };

    // Função para remover funcionário
    const removeEmployee = async (id: number) => {
        try {
            // Deleta funcionário
            await employeeService.delete(id);
            // Remove da lista
            setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
        } catch (err) {
            // Log erro
            console.error("Failed to delete employee:", err);
            // Re-lança erro
            throw err;
        }
    };

    // Retorna estado e funções
    return {
        employees,
        loading,
        error,
        addEmployee,
        updateEmployee,
        removeEmployee,
        refetch: fetchEmployees,
    };
}
