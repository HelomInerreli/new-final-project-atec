
/**
 * Formata uma data para o formato português (dd de mês de yyyy).
 * @param dateString - String da data (e.g., '2023-10-01').
 * @returns String formatada.
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}