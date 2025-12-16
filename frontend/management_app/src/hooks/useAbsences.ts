import { useState, useEffect } from 'react';
import { absenceService } from '../services/absenceService';
import type { Absence, AbsenceType, AbsenceStatus, AbsenceRequestCreate } from '../interfaces/Absence';

export const useAbsences = (employeeId?: number, statusId?: number) => {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const deleteAbsence = async (id: number) => {
        try {
            await absenceService.delete(id);
            setAbsences(absences.filter(a => a.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao apagar ausência');
            throw err;
        }
    };

    useEffect(() => {
        fetchAbsences();
    }, [employeeId, statusId]);

    return {
        absences,
        loading,
        error,
        createAbsence,
        updateAbsenceStatus,
        deleteAbsence,
        refetch: fetchAbsences,
    };
};

export const useAbsenceTypes = () => {
    const [types, setTypes] = useState<AbsenceType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

    return { types, loading, error };
};

export const useAbsenceStatuses = () => {
    const [statuses, setStatuses] = useState<AbsenceStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

    return { statuses, loading, error };
};