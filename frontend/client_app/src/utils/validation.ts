import type { Vehicle } from '../interfaces/vehicle';

export function validateVehicleForm(formData: Vehicle, t: (key: string) => string): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!formData.plate.trim()) {
        errors.plate = t('vehicleModal.errors.plateRequired');
    } else if (!/^[A-Z0-9-]{6,10}$/.test(formData.plate)) {
        errors.plate = t('vehicleModal.errors.plateInvalid');
    }

    if (!formData.brand.trim()) {
        errors.brand = t('vehicleModal.errors.brandRequired');
    }   

    if (!formData.model.trim()) {
        errors.model = t('vehicleModal.errors.modelRequired');
    }
    
    if (formData.kilometers === "" || formData.kilometers === null || formData.kilometers === undefined) {
        errors.kilometers = t('vehicleModal.errors.kilometersRequired');
    } else if (typeof formData.kilometers === 'number' && formData.kilometers < 0) {
        errors.kilometers = t('vehicleModal.errors.kilometersInvalid');
    }

    return errors;
}