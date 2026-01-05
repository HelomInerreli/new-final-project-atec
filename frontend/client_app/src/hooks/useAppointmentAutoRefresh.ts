import { useState, useEffect, useCallback } from 'react';
import type { Appointment } from '../interfaces/appointment';
import { fetchAppointmentById } from '../services/appointmentDetails';

/**
 * Hook para buscar e atualizar automaticamente os detalhes de um appointment
 * Implementa polling automático a cada 5 segundos quando o appointment está aberto
 * @param appointmentId - ID do appointment a ser monitorizado
 * @param isOpen - Se o modal está aberto (para controlar o polling)
 * @param refreshInterval - Intervalo de atualização em milissegundos (padrão: 5000)
 * @returns Objeto com appointment, estado de loading e erro
 */
export function useAppointmentAutoRefresh(
  appointmentId: number | null,
  isOpen: boolean,
  refreshInterval: number = 5000
) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função para buscar o appointment (pode ser silenciosa para não mostrar loading)
   */
  const fetchAppointment = useCallback(async (silent = false) => {
    if (!appointmentId) return;
    
    if (!silent) setLoading(true);
    
    try {
      const data = await fetchAppointmentById(appointmentId);
      setAppointment(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching appointment:', err);
      setError(err.message || 'Erro ao carregar agendamento');
      if (!silent) {
        setAppointment(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [appointmentId]);

  /**
   * Carregamento inicial quando o modal é aberto
   */
  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointment(false);
    }
  }, [isOpen, appointmentId, fetchAppointment]);

  /**
   * Auto-refresh: polling a cada X segundos quando o modal está aberto
   */
  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    const interval = setInterval(() => {
      fetchAppointment(true); // silent = true para não mostrar loading
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isOpen, appointmentId, refreshInterval, fetchAppointment]);

  /**
   * Função para forçar refresh manual
   */
  const refresh = useCallback(() => {
    fetchAppointment(false);
  }, [fetchAppointment]);

  return { 
    appointment, 
    loading, 
    error, 
    refresh 
  };
}
