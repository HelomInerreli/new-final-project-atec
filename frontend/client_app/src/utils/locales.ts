import { pt, fr, es, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export const locales: { [key: string]: Locale } = {
    pt: pt,
    fr: fr,
    es: es,
    en: enUS
};