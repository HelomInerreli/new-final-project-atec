export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  customer_id: number;
  deleted_at?: string;
}

export interface VehicleCreate {
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  customer_id: number;
}

export interface VehicleUpdate {
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  customer_id: number;
}