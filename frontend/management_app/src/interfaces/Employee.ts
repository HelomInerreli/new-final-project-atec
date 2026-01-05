import type { Role } from './Role';

export interface Employee {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string; // ISO 8601 date string
    salary: number;
    hired_at: string; // ISO 8601 date string
    role_id: number;
    is_manager: boolean;
    role: Role;
}

export interface EmployeeCreate {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string; // Formato ISO: "YYYY-MM-DDTHH:mm:ss"
    salary: number;
    hired_at: string; // Formato ISO
    role_id: number;
    is_manager?: boolean;
}

export interface EmployeeUpdate {
    name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    salary?: number;
    hired_at?: string;
    role_id?: number;
    is_manager?: boolean;
}