/**
 * Interface para representação de informações detalhadas de um serviço
 * Utilizada para exibição de serviços com funcionalidades e características
 * Contém informações estendidas comparado à interface Service básica
 */
export interface ServiceInfo{
    /** ID único do serviço */
    id: number;
    /** Nome do serviço */
    name: string;
    /** Descrição detalhada do serviço */
    description: string;
    /** Lista de características/funcionalidades do serviço */
    features: string[];
    /** URL do ícone representativo do serviço (opcional) */
    icon?: string;
    /** Faixa de preço ou preço base do serviço (opcional) */
    priceRange?: number;
}

/**
 * Props para componente ServiceCard
 * Define propriedades necessárias para renderizar card de serviço
 */
export interface ServiceCardProps{
    /** Objeto do serviço a ser exibido no card */
    service: Service;
    /** Callback opcional executado quando serviço é selecionado */
    onSelect?: () => void;
}

/**
 * Interface principal para representação de um serviço da API
 * Contém dados básicos do serviço retornados pelo backend
 * Utilizada em operações de leitura e exibição de serviços disponíveis
 */
export interface Service {
    /** ID único do serviço */
    id: number;
    /** Nome do serviço */
    name: string;
    /** Descrição do serviço (null se não fornecida) */
    description: string | null;
    /** Preço do serviço em valor monetário */
    price: number;
    /** Duração estimada do serviço em minutos (null se não definida) */
    duration_minutes: number | null;
    /** Flag indicando se serviço está ativo/disponível para agendamento */
    is_active: boolean;
}