export interface ServiceInfo{
    id: number;
    name: string;
    description: string;
    features: string[];
    icon?: string;
    priceRange?: number;
}

export interface ServiceCardProps{
    service: Service;
    onSelect?: () => void;
}

export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number | null;
    is_active: boolean;
}