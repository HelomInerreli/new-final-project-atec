import { useState } from 'react';
import { type AppointmentForm } from '../interfaces/appointment';

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

  const updateDateTime = (date: string, time: string) => {
    if (date && time) {
      const dateTime = `${date}T${time}`;
      setForm(prev => ({ ...prev, appointment_date: dateTime }));
    } else {
      setForm(prev => ({ ...prev, appointment_date: '' }));
    }
  };

  const updateField = <K extends keyof AppointmentForm>(
    field: K,
    value: AppointmentForm[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

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