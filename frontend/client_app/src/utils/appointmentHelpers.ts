/**
 * Formata data/hora do appointment para exibição
 * @param date - ISO string (ex: "2025-11-15T14:30:00")
 * @returns Data formatada (ex: "15/11/2025, 14:30:00")
 */
export function formatAppointmentDateTime(date: string, locale: string = 'pt-PT'): string {
  return new Date(date).toLocaleString(locale);
}

/**
 * Retorna data de hoje no formato YYYY-MM-DD
 * @returns Data de hoje (ex: "2025-11-15")
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retorna data mínima permitida (hoje)
 * Útil para input type="date"
 */
export function getMinDateString(): string {
  return getTodayDateString();
}

/**
 * Retorna data máxima permitida (6 meses à frente)
 */
export function getMaxDateString(): string {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  return maxDate.toISOString().split('T')[0];
}

/**
 * Valida se descrição tem comprimento mínimo
 * @param description - Texto a validar
 * @param minLength - Comprimento mínimo (padrão: 4)
 */
export function isValidDescription(
  description: string, 
  minLength: number = 4
): boolean {
  return description.trim().length >= minLength;
}

/**
 * Formata data para exibição curta
 * @param date - ISO string
 * @returns Data formatada (ex: "15/11/2025")
 */
export function formatShortDate(date: string, locale: string = 'pt-PT'): string {
  return new Date(date).toLocaleDateString(locale);
}

/**
 * Formata hora para exibição
 * @param date - ISO string
 * @returns Hora formatada (ex: "14:30")
 */
export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Combina data e hora em ISO string
 * @param date - Data (YYYY-MM-DD)
 * @param time - Hora (HH:mm)
 * @returns ISO string completo
 */
export function combineDateAndTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}