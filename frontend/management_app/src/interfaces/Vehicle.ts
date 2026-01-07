// Interface para veículo
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

// Interface para criar veículo
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

// Interface para atualizar veículo
export interface VehicleUpdate {
  plate?: string;
  brand?: string;
  model?: string;
  kilometers?: number;
  customer_id?: number;
  description?: string;
  color?: string;
  imported?: boolean;
  engineSize?: string;
  fuelType?: string;
}

// Interface para mapa de contagem de veículos
export interface VehicleCountMap {
  [customerId: string]: number;
}

// Interface para veículo com nome do cliente
export interface VehicleWithCustomer extends Vehicle {
  customer_name?: string;
}