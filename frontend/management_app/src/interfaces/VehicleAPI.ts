export interface VehicleAPI {
  id: number;
  plate: string;
  abiCode?: string;
  description?: string;
  brand?: string;
  model?: string;
  engineSize?: string;
  fuelType?: string;
  numberOfSeats?: string;
  version?: string;
  colour?: string;
  vehicleIdentificationNumber?: string;
  grossWeight?: string;
  netWeight?: string;
  imported?: boolean;
  RegistrationDate?: string;
  imageUrl?: string;
  kilometers?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface VehicleAPICreate {
  plate: string;
  abiCode?: string;
  description?: string;
  brand?: string;
  model?: string;
  engineSize?: string;
  fuelType?: string;
  numberOfSeats?: string;
  version?: string;
  colour?: string;
  vehicleIdentificationNumber?: string;
  grossWeight?: string;
  netWeight?: string;
  imported?: boolean;
  RegistrationDate?: string;
  imageUrl?: string;
  kilometers?: number;
}

export interface VehicleAPIUpdate {
  plate?: string;
  abiCode?: string;
  description?: string;
  brand?: string;
  model?: string;
  engineSize?: string;
  fuelType?: string;
  numberOfSeats?: string;
  version?: string;
  colour?: string;
  vehicleIdentificationNumber?: string;
  grossWeight?: string;
  netWeight?: string;
  imported?: boolean;
  RegistrationDate?: string;
  imageUrl?: string;
  kilometers?: number;
}