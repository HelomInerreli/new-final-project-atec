export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  customer_id: number;
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