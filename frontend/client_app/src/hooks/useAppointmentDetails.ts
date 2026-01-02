import { useState, useEffect } from 'react';
import type { Appointment } from '../interfaces/appointment';
import { fetchAppointmentById } from '../services/appointmentDetails';

/**
 * Hook para buscar e gerir detalhes de um agendamento específico
 * @param id - ID do agendamento a ser carregado (null se nenhum selecionado)
 * @returns Objeto com dados do agendamento, estado de loading e erro
 */
export function useAppointmentDetails(id: number | null) {
    /**
     * Estado para armazenar os dados completos do agendamento
     * Tipo: Appointment | null
     * Inicia como null (sem dados)
     */
    const [appointment, setAppointment] = useState<Appointment | null>(null);

    /**
     * Estado para indicar se os dados estão sendo carregados
     * Tipo: boolean
     * Inicia como false
     */
    const [loading, setLoading] = useState(false);

    /**
     * Estado para armazenar mensagens de erro
     * Tipo: string | null
     * Inicia como null (sem erro)
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Efeito para buscar os detalhes do agendamento quando o ID muda
     * Se não houver ID, não executa a busca
     */
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchAppointmentById(id)
            .then(setAppointment)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    return { appointment, loading, error };
}