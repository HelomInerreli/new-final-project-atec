export interface Vehicle {
  id: number;
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
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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