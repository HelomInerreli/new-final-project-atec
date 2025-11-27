

export interface Vehicle {
    id?: number;
    plate: string;
    brand: string;
    model: string;
    kilometers: number;
    customer_id: number;
    deleted_at?: string | null;
}

export interface VehicleCreate {
    plate: string;
    brand: string;
    model: string;
    kilometers: number;
    customer_id: number;
}

export interface VehicleUpdate {
    plate?: string;
    brand?: string;
    model?: string;
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
}