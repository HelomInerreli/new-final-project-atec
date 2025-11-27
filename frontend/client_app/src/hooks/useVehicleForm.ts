import { useState, useEffect } from "react";
import type { Vehicle } from "../interfaces/vehicle";
import { validateVehicleForm } from "../utils/validation";

export function useVehicleForm(
    vehicle: Vehicle | null,
    customerId: number,
    t: (key: string) => string
) {
    const [formData, setFormData] = useState<Vehicle>({
        plate: "",
        brand: "",
        model: "",
        kilometers: 0,
        customer_id: customerId,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                customer_id: vehicle.customer_id || customerId,
            });
        } else {
            setFormData({
                plate: "",
                brand: "",
                model: "",
                kilometers: 0,
                customer_id: customerId,
            });
        }
        setErrors({});
    }, [vehicle, customerId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "kilometers" ? parseInt(value) || 0 : value.toUpperCase(),
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (
        e: React.FormEvent,
        onSave: (data: Vehicle) => Promise<void>,
        onClose: () => void
    ) => {
        e.preventDefault();
        const newErrors = validateVehicleForm(formData, t);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);
            await onSave({ ...formData, customer_id: customerId });
            onClose();
        } catch (error) {
            console.error("Erro ao salvar veículo:", error);
        } finally {
            setLoading(false);
        }
    };

    return { formData, errors, loading, handleChange, handleSubmit };
}
