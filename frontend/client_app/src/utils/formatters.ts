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