import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../services/EmployeeService';
import type { Employee, EmployeeCreate, EmployeeUpdate } from '../interfaces/Employee';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const data = await employeeService.getAll();
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const addEmployee = async (employeeData: EmployeeCreate) => {
        try {
            const newEmployee = await employeeService.create(employeeData);
            setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
        } catch (err) {
            console.error("Failed to add employee:", err);
            // Re-lança o erro para que o componente o possa tratar (ex: mostrar um toast)
            throw err;
        }
    };

    const updateEmployee = async (id: number, employeeData: EmployeeUpdate) => {
        try {
            const updatedEmployee = await employeeService.update(id, employeeData);
            setEmployees((prevEmployees) =>
                prevEmployees.map((emp) => (emp.id === id ? updatedEmployee : emp))
            );
        } catch (err) {
            console.error("Failed to update employee:", err);
            throw err;
        }
    };

    const removeEmployee = async (id: number) => {
        try {
            await employeeService.delete(id);
            setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
        } catch (err) {
            console.error("Failed to delete employee:", err);
            throw err;
        }
    };

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
