import { useTranslation } from 'react-i18next';

/**
 * Formata quilômetros com base no idioma atual.
 * @param km - Número de quilômetros.
 * @returns String formatada (e.g., "1.234 km" em pt-PT).
 */
export function formatKilometers(km: number): string {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-PT' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
  return `${km.toLocaleString(locale)} km`;
}

/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(value: number | string | null | undefined): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
        return '€0,00';
    }
    
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue);
}

/**
 * Format a date string to Portuguese locale
 */
export function formatDate(date: string | Date | null | undefined): string {
    if (!date) {
        return 'N/A';
    }
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) {
            return 'Data inválida';
        }
        
        return new Intl.DateTimeFormat('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Data inválida';
    }
}

/**
 * Format a date and time string to Portuguese locale
 */
export function formatDateTime(date: string | Date | null | undefined): string {
    if (!date) {
        return 'N/A';
    }
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) {
            return 'Data inválida';
        }
        
        return new Intl.DateTimeFormat('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    } catch (error) {
        console.error('Error formatting date time:', error);
        return 'Data inválida';
    }
}

/**
 * Format a phone number
 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) {
        return 'N/A';
    }
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Portuguese phone numbers (9 digits)
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // Return original if not standard format
    return phone;
}

/**
 * Format a NIF (Portuguese tax ID)
 */
export function formatNIF(nif: string | null | undefined): string {
    if (!nif) {
        return 'N/A';
    }
    
    // Remove all non-numeric characters
    const cleaned = nif.replace(/\D/g, '');
    
    // Format Portuguese NIF (9 digits)
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // Return original if not standard format
    return nif;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string | null | undefined): string {
    if (!text) {
        return '';
    }
    
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Format invoice number with padding
 */
export function formatInvoiceNumber(id: number, year?: number): string {
    const currentYear = year || new Date().getFullYear();
    return `INV-${currentYear}-${String(id).padStart(6, '0')}`;
}