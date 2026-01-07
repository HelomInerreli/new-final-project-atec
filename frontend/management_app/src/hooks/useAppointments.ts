/**
 * Hook personalizado para buscar todos os agendamentos.
 * Retorna lista de agendamentos, loading e erro.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import type { Appointment } from '../interfaces/Appointment';
// Tipo para agendamento

// Hook para buscar todos os agendamentos
export const useFetchAppointments = () => {
  // Estado para lista de agendamentos
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar agendamentos na montagem
  useEffect(() => {
    // Função assíncrona para buscar agendamentos
    const fetchAppointments = async () => {
      try {
        // Inicia carregamento
        setLoading(true);
        // Faz requisição para API
        const response = await fetch('http://localhost:8000/api/v1/appointments/');

        // Verifica se resposta é ok
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        // Converte resposta para JSON
        const data = await response.json();
        // Define agendamentos
        setAppointments(data);
        // Limpa erro
        setError(null);
      } catch (err) {
        // Define erro
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Limpa agendamentos
        setAppointments([]);
      } finally {
        // Finaliza carregamento
        setLoading(false);
      }
    };

    // Chama função de busca
    fetchAppointments();
  }, []);

  // Retorna estado
  return { appointments, loading, error };
};

/**
 * Hook personalizado para buscar agendamentos de um cliente específico.
 * Filtra agendamentos por ID do cliente.
 * @param customerId - ID do cliente
 * @returns Lista de agendamentos, loading e erro
 */

// Hook para buscar agendamentos de cliente
export const useFetchCustomerAppointments = (customerId: string | null) => {
  // Estado para lista de agendamentos
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar quando customerId muda
  useEffect(() => {
    // Se não há customerId, limpa agendamentos
    if (!customerId) {
      setAppointments([]);
      return;
    }

    // Função assíncrona para buscar agendamentos
    const fetchAppointments = async () => {
      try {
        // Inicia carregamento
        setLoading(true);
        // Faz requisição para API
        const response = await fetch('http://localhost:8000/api/v1/appointments/');

        // Verifica se resposta é ok
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        // Converte resposta para JSON
        const data: Appointment[] = await response.json();

        // Filtra agendamentos por customer_id
        const customerAppointments = data.filter(
          (appointment) => appointment.customer_id.toString() === customerId
        );

        // Define agendamentos filtrados
        setAppointments(customerAppointments);
        // Limpa erro
        setError(null);
      } catch (err) {
        // Define erro
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Limpa agendamentos
        setAppointments([]);
      } finally {
        // Finaliza carregamento
        setLoading(false);
      }
    };

    // Chama função de busca
    fetchAppointments();
  }, [customerId]);

  // Retorna estado
  return { appointments, loading, error };
};
