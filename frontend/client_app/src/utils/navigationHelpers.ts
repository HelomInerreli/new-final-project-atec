import type { ClientSection } from '../pages/clientLayout/ClientLayout';

/**
 * Utility para navegação entre seções do ClientLayout
 * Permite navegação com mudança de URL usando query parameters
 */

/**
 * Navega para uma seção específica do ClientLayout
 * Atualiza a URL com o parâmetro ?section=...
 * 
 * @param section - Seção de destino
 * @param navigate - Função navigate do react-router-dom
 * 
 * @example
 * // Navegar para veículos
 * navigateToSection('vehicles', navigate);
 * // URL resultante: /my-services?section=vehicles
 */
export function navigateToSection(
    section: ClientSection,
    navigate: (path: string) => void
): void {
    navigate(`/my-services?section=${section}`);
}

/**
 * Obtém a seção ativa da URL atual
 * Lê o parâmetro ?section=... da URL
 * 
 * @param defaultSection - Seção padrão se não houver parâmetro na URL
 * @returns A seção ativa
 * 
 * @example
 * // URL: /my-services?section=vehicles
 * const section = getActiveSectionFromURL(); // retorna 'vehicles'
 */
export function getActiveSectionFromURL(
    defaultSection: ClientSection = 'dashboard'
): ClientSection {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') as ClientSection;
    
    // Validar se é uma seção válida
    const validSections: ClientSection[] = [
        'dashboard',
        'appointments',
        'vehicles',
        'service-history',
        'invoices'
    ];
    
    if (section && validSections.includes(section)) {
        return section;
    }
    
    return defaultSection;
}

/**
 * Gera URL completa para uma seção específica
 * Útil para criar links ou compartilhar URLs
 * 
 * @param section - Seção de destino
 * @returns URL completa
 * 
 * @example
 * const url = getSectionURL('vehicles');
 * // retorna: '/my-services?section=vehicles'
 */
export function getSectionURL(section: ClientSection): string {
    return `/my-services?section=${section}`;
}

/**
 * Mapeia seções para rotas antigas (para compatibilidade)
 * Útil se você ainda tiver links antigos
 */
export const SECTION_ROUTE_MAP: Record<ClientSection, string> = {
    'dashboard': '/my-services?section=dashboard',
    'appointments': '/my-services?section=appointments',
    'vehicles': '/my-services?section=vehicles',
    'service-history': '/my-services?section=service-history',
    'invoices': '/my-services?section=invoices',
};

/**
 * Traduz rota antiga para seção do ClientLayout
 * Útil para migração de rotas antigas
 * 
 * @param oldRoute - Rota antiga (ex: '/vehicles', '/appointments')
 * @returns Seção correspondente ou null
 */
export function mapOldRouteToSection(oldRoute: string): ClientSection | null {
    const routeMap: Record<string, ClientSection> = {
        '/vehicles': 'vehicles',
        '/appointments': 'appointments',
        '/past-appointments': 'service-history',
        '/invoices': 'invoices',
        '/dashboard': 'dashboard',
    };
    
    return routeMap[oldRoute] || null;
}
