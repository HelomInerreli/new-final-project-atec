// Interface para ausência
export interface Absence {
  id: number;
  day: string;
  status: { id: number; name: string };
  absence_type: { id: number; name: string };
  employee: { id: number; name: string; email: string };
}

// Interface para criar pedido de ausência
export interface AbsenceRequestCreate {
  employee_id: number;
  absence_type_id: number;
  status_id?: number;
  days: string[];
}

// Interface para tipo de ausência
export interface AbsenceType {
  id: number;
  name: string;
}

// Interface para status de ausência
export interface AbsenceStatus {
  id: number;
  name: string;
}