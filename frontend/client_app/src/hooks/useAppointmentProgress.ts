import { useMemo } from 'react';
import { type AppointmentForm } from '../interfaces/appointment';

/**
 * Interface para o resultado do progresso do formulário
 */
interface ProgressResult {
  /** Percentual de progresso (0-100) */
  progress: number;
  /** Posição esquerda do carro em porcentagem (para animação) */
  carLeft: string;
  /** Indica se o formulário está 100% completo */
  isComplete: boolean;
}

/**
 * Hook para calcular o progresso do formulário de agendamento
 * @param form - Estado atual do formulário de agendamento
 * @param selectedDate - Data selecionada (YYYY-MM-DD)
 * @param selectedTime - Hora selecionada (HH:mm)
 * @returns Objeto com progresso, posição do carro e status de completude
 */
export function useAppointmentProgress(
  form: AppointmentForm,
  selectedDate: string,
  selectedTime: string
): ProgressResult {
  /**
   * Calcula o percentual de progresso baseado nos campos preenchidos
   */
  const progress = useMemo(() => {
    const checks = [
      !!form.service_id,
      !!form.estimated_budget && form.estimated_budget > 0,
      !!selectedDate,
      !!selectedTime,
      !!form.vehicle_id,
      !!form.description && form.description.trim().length > 3,
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [form, selectedDate, selectedTime]);

  /**
   * Calcula a posição esquerda do carro para animação (1% a 99%)
   */
  const carLeft = useMemo(() => {
    const start = 1;
    const end = 99;
    const pct = Math.max(0, Math.min(100, progress));
    return `${start + ((end - start) * pct) / 100}%`;
  }, [progress]);

  /**
   * Verifica se o formulário está 100% completo
   */
  const isComplete = useMemo(() => progress === 100, [progress]);

  return { progress, carLeft, isComplete };
}