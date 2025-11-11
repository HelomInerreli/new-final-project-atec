export interface Service{
    id: number;
    name: string;
    description?: string;
    price: number;
}

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