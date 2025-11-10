import { useMemo } from 'react';
import { formatInvoiceDate } from '../utils/invoice';

export function useInvoiceFormatting(appointmentDate: string, dueDate?: string) {
  const formattedAppointmentDate = useMemo(
    () => formatInvoiceDate(appointmentDate),
    [appointmentDate],
  );

  const formattedDueDate = useMemo(() => {
    if (!dueDate) {
      return formattedAppointmentDate;
    }
    return formatInvoiceDate(dueDate);
  }, [dueDate, formattedAppointmentDate]);

  return {
    formattedAppointmentDate,
    formattedDueDate,
  };
}