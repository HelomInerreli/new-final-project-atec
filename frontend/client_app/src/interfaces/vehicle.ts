

export interface Vehicle {
    id?: number;
    plate: string;
    brand: string;
    model: string;
    kilometers: number;
    customer_id: number;
    description?: string;
    color?: string;
    imported?: boolean;
    engineSize?: string;
    fuelType?: string;
    deleted_at?: string | null;
}

export interface VehicleCreate {
    plate: string;
    brand: string;
    model: string;
    kilometers: number;
    customer_id: number;
    description?: string;
    color?: string;
    imported?: boolean;
    engineSize?: string;
    fuelType?: string;
}

export interface VehicleUpdate {
    plate?: string;
    brand?: string;
    model?: string;
    kilometers?: number;
    description?: string;
    color?: string;
    imported?: boolean;
    engineSize?: string;
    fuelType?: string;
}

export interface VehicleAPIData {
    plate: string;
    brand?: string;
    model?: string;
    description?: string;
    colour?: string;
    engineSize?: string;
    fuelType?: string;
    imported?: boolean;
    kilometers?: number;
}

export interface VehicleCardProps {
    vehicle: Vehicle;
    onEdit?: (vehicle: Vehicle) => void;
    onDelete?: (vehicleId: number) => void;
}


export interface VehicleModalProps {
    show: boolean;
    vehicle?: Vehicle | null;
    customerId: number;
    onClose: () => void;
    onSave: (vehicle: Vehicle) => Promise<void>;
    getFromAPI?: (plate: string) => Promise<VehicleAPIData>;
}