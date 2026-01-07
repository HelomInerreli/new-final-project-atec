// Importa tipo Vehicle
import type { Vehicle } from "./Vehicle";

// Interface para cliente
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

// Interface para criar cliente
export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

// Interface para registrar cliente
export interface CustomerRegister {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

// Interface para atualizar cliente
export interface CustomerUpdate {
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

// Interface para autenticação do cliente
export interface CustomerAuth {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para informações do perfil do cliente
export interface CustomerProfileInfo {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}

// Interface para perfil do cliente
export interface CustomerProfile {
  auth: CustomerAuth;
  customer: CustomerProfileInfo;
}

// Interface para perfil completo do cliente
export interface CompleteCustomerProfile {
  auth: {
    id: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    birth_date: string | null;
    created_at: string;
    updated_at: string;
  };
  vehicles: Vehicle[];
}