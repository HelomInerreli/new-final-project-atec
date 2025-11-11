import { useMemo } from 'react';
import { type AppointmentForm } from '../interfaces/appointment';

interface ProgressResult {
  progress: number;
  carLeft: string;
  isComplete: boolean;
}

export function useAppointmentProgress(
  form: AppointmentForm,
  selectedDate: string,
  selectedTime: string
): ProgressResult {
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

  const carLeft = useMemo(() => {
    const start = 1;
    const end = 99;
    const pct = Math.max(0, Math.min(100, progress));
    return `${start + ((end - start) * pct) / 100}%`;
  }, [progress]);

  const isComplete = useMemo(() => progress === 100, [progress]);

  return { progress, carLeft, isComplete };
}