/**
 * Hooks personalizados para gerenciar ausências, tipos de ausência e status de ausência.
 * Fornece funcionalidades para buscar, criar, atualizar e deletar ausências.
 */

import { useState, useEffect } from 'react'; // Importa hooks do React para estado e efeitos
import { absenceService } from '../services/absenceService'; // Serviço para operações de ausência
import type { Absence, AbsenceType, AbsenceStatus, AbsenceRequestCreate } from '../interfaces/Absence'; // Tipos para ausências

/**
 * Hook para gerenciar ausências de funcionários.
 * Permite buscar, criar, atualizar status e deletar ausências.
 * @param employeeId - ID opcional do funcionário para filtrar ausências
 * @param statusId - ID opcional do status para filtrar ausências
 * @returns Objeto com estado e funções para manipular ausências
 */
export const useAbsences = (employeeId?: number, statusId?: number) => {
    const [absences, setAbsences] = useState<Absence[]>([]); // Estado para lista de ausências
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [error, setError] = useState<string | null>(null); // Estado de erro

    // Função para buscar ausências
    const fetchAbsences = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await absenceService.getAll(employeeId, statusId);
            setAbsences(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar ausências');
        } finally {
            setLoading(false);
        }
    };

    // Função para criar novas ausências
    const createAbsence = async (absenceData: AbsenceRequestCreate) => {
        try {
            const newAbsences = await absenceService.createBulk(absenceData);
            setAbsences([...absences, ...newAbsences]);
            return newAbsences;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar ausência');
            throw err;
        }
    };

    // Função para atualizar status de uma ausência
    const updateAbsenceStatus = async (id: number, statusId: number) => {
        try {
            const updated = await absenceService.updateStatus(id, statusId);
            setAbsences(absences.map(a => a.id === id ? updated : a));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
            throw err;
        }
    };

    // Função para deletar uma ausência
    const deleteAbsence = async (id: number) => {
        try {
            await absenceService.delete(id);
            setAbsences(absences.filter(a => a.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao apagar ausência');
            throw err;
        }
    };

    // Efeito para buscar ausências quando parâmetros mudam
    useEffect(() => {
        fetchAbsences();
    }, [employeeId, statusId]);

    return {
        absences, // Lista de ausências
        loading, // Indicador de carregamento
        error, // Mensagem de erro
        createAbsence, // Função para criar ausência
        updateAbsenceStatus, // Função para atualizar status
        deleteAbsence, // Função para deletar ausência
        refetch: fetchAbsences, // Função para recarregar ausências
    };
};

/**
 * Hook para buscar tipos de ausência.
 * @returns Objeto com tipos de ausência, loading e error
 */
export const useAbsenceTypes = () => {
    const [types, setTypes] = useState<AbsenceType[]>([]); // Estado para lista de tipos
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [error, setError] = useState<string | null>(null); // Estado de erro

    useEffect(() => {
        // Função para buscar tipos de ausência
        const fetchTypes = async () => {
            setLoading(true);
            try {
                const data = await absenceService.getAbsenceTypes();
                setTypes(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar tipos');
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    return { types, loading, error }; // Retorna tipos, loading e error
};

/**
 * Hook para buscar status de ausência.
 * @returns Objeto com status de ausência, loading e error
 */
export const useAbsenceStatuses = () => {
    const [statuses, setStatuses] = useState<AbsenceStatus[]>([]); // Estado para lista de status
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [error, setError] = useState<string | null>(null); // Estado de erro

    useEffect(() => {
        // Função para buscar status de ausência
        const fetchStatuses = async () => {
            setLoading(true);
            try {
                const data = await absenceService.getAbsenceStatuses();
                setStatuses(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar status');
            } finally {
                setLoading(false);
            }
        };
        fetchStatuses();
    }, []);

    return { statuses, loading, error }; // Retorna status, loading e error
};