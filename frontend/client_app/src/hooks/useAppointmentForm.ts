import { useState } from 'react';
import { type AppointmentForm } from '../interfaces/appointment';

/**
 * Hook personalizado para gerenciar o estado do formulário de agendamento
 * @returns Objeto com estado do form, setters e funções utilitárias
 */
export function useAppointmentForm() {
  const [form, setForm] = useState<AppointmentForm>({
    appointment_date: '',
    description: '',
    estimated_budget: 0,
    vehicle_id: 0,
    service_id: 0,
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  /**
   * Combina data e hora em formato ISO 8601 para appointment_date
   * @param date - Data no formato YYYY-MM-DD
   * @param time - Hora no formato HH:mm
   */
  const updateDateTime = (date: string, time: string) => {
    if (date && time) {
      const dateTime = `${date}T${time}`;
      setForm(prev => ({ ...prev, appointment_date: dateTime }));
    } else {
      setForm(prev => ({ ...prev, appointment_date: '' }));
    }
  };

  /**
   * Atualiza um campo específico do formulário de forma type-safe
   * @template K - Chave do AppointmentForm
   * @param field - Nome do campo a atualizar
   * @param value - Novo valor para o campo
   */
  const updateField = <K extends keyof AppointmentForm>(
    field: K,
    value: AppointmentForm[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Reseta todos os campos do formulário para valores iniciais
   */
  const resetForm = () => {
    setForm({
      appointment_date: '',
      description: '',
      estimated_budget: 0,
      vehicle_id: 0,
      service_id: 0,
    });
    setSelectedDate('');
    setSelectedTime('');
  };

  return {
    form,
    setForm,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    updateDateTime,
    updateField,
    resetForm,
  };
}