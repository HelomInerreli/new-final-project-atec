export interface Absence {
  id: number;
  day: string;
  status: { id: number; name: string };
  absence_type: { id: number; name: string };
  employee: { id: number; name: string; email: string };
}

export interface AbsenceRequestCreate {
  employee_id: number;
  absence_type_id: number;
  status_id?: number;
  days: string[];
}

export interface AbsenceType {
  id: number;
  name: string;
}

export interface AbsenceStatus {
  id: number;
  name: string;
}