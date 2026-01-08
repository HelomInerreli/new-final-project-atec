import type { Role } from './Role';

// Interface para usuário atual
export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  employee_id?: number;
  // Employee fields (if user is linked to an employee)
  last_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  salary?: number;
  hired_at?: string;
  is_manager?: boolean;
  role_id?: number;
  employee_role?: Role;
}