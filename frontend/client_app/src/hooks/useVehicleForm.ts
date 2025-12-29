import { useState, useEffect } from "react";
import type { Vehicle, VehicleAPIData } from "../interfaces/vehicle";
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
        description: "",
        color: "",
        imported: false,
        engineSize: "",
        fuelType: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                customer_id: vehicle.customer_id || customerId,
                description: vehicle.description || "",
                color: vehicle.color || "",
                imported: vehicle.imported || false,
                engineSize: vehicle.engineSize || "",
                fuelType: vehicle.fuelType || "",
            });
        } else {
            setFormData({
                plate: "",
                brand: "",
                model: "",
                kilometers: 0,
                customer_id: customerId,
                description: "",
                color: "",
                imported: false,
                engineSize: "",
                fuelType: "",
            });
        }
        setErrors({});
    }, [vehicle, customerId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox" ? checked : 
                name === "kilometers" ? parseInt(value) || 0 : 
                name === "plate" ? value.toUpperCase() : 
                value,
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

    const handleGetFromAPI = async (getFromAPIFunc?: (plate: string) => Promise<VehicleAPIData>) => {
        if (getFromAPIFunc && formData.plate) {
            try {
                setLoading(true);
                const apiData = await getFromAPIFunc(formData.plate);
                if (apiData) {
                    setFormData(prev => ({
                        ...prev,
                        brand: apiData.brand || prev.brand,
                        model: apiData.model || prev.model,
                        color: apiData.colour || prev.color,
                        engineSize: apiData.engineSize || prev.engineSize,
                        fuelType: apiData.fuelType || prev.fuelType,
                        imported: apiData.imported !== undefined ? apiData.imported : prev.imported,
                        description: apiData.description || (apiData.brand && apiData.model ? `${apiData.brand} ${apiData.model}` : prev.description),
                        kilometers: apiData.kilometers || prev.kilometers,
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return { formData, errors, loading, handleChange, handleSubmit, handleGetFromAPI };
}
