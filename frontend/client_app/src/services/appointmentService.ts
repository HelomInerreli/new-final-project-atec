import { type CreateAppointmentData, type AppointmentForm } from '../interfaces/appointment';
import { type Vehicle } from '../interfaces/vehicle';
import { createAppointment as createAppointmentAPI } from './customerService';

export async function submitAppointment(data: CreateAppointmentData): Promise<void> {
    return createAppointmentAPI(data);
}

// ✅ FIX: Aceitar AppointmentForm em vez de CreateAppointmentData
export function validateAppointmentForm(
    form: AppointmentForm,  // ← Mudado aqui
    vehicles: Vehicle[],
    loadingData: boolean
): boolean {
    return !!(
        !loadingData &&
        vehicles.length > 0 &&
        form.appointment_date &&
        form.vehicle_id &&
        form.description &&
        form.description.trim().length > 3  // ✅ Validação melhorada
    );
}