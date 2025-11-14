import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../api/auth';
import { useTranslation } from 'react-i18next';
import type { Vehicle } from '../interfaces/vehicle';
import { vehicleService } from '../services/vehicleServices';

export function useVehicles() {
    const { t } = useTranslation();
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Adicionado tipo explícito
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const loadVehicles = useCallback(async () => {
        if (!loggedInCustomerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await vehicleService.getByCustomer(loggedInCustomerId);
            if (Array.isArray(data)) {
                const activeVehicles = data.filter(vehicle => !vehicle.deleted_at);
                setVehicles(activeVehicles);
            } else {
                
                setError(t('vehiclesPage.invalidData'));
            }
        } catch (error: any) {
            setError(error.message || t('vehiclesPage.errorLoading'));
        } finally {
            setLoading(false);
        }
    }, [loggedInCustomerId, t]);

    useEffect(() => {
        if (isLoggedIn && loggedInCustomerId) {
            loadVehicles();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, loggedInCustomerId, loadVehicles]);

    const handleEdit = useCallback((vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    }, []);

    const handleDelete = useCallback(async (vehicleId: number) => {
        if (!window.confirm(t('vehiclesPage.deleteConfirm'))) {
            return;
        }

        try {
            await vehicleService.delete(vehicleId);
            setVehicles(prev => prev.filter(v => v.id !== vehicleId));
            alert(t('vehiclesPage.deleteSuccess'));
        } catch (error: any) {
            console.error('Erro ao eliminar veículo:', error);
            alert(error.message || t('vehiclesPage.deleteError'));
        }
    }, [t]);

    const handleAddVehicle = useCallback(() => {
        setSelectedVehicle(null);
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedVehicle(null);
    }, []);

    const handleSaveVehicle = useCallback(async (vehicleData: Vehicle) => {
        try {
            const isEditing = !!selectedVehicle?.id;

            if (isEditing && selectedVehicle.id) {
                // Editar veículo existente
                const { id, deleted_at, customer_id, ...updateData } = vehicleData;
                await vehicleService.update(selectedVehicle.id, updateData);
            } else {
                // Criar novo veículo
                const { id, deleted_at, ...createData } = vehicleData;
                await vehicleService.create(createData);
            }

            await loadVehicles();

            const successMessage = isEditing
                ? t('vehiclesPage.updateSuccess')
                : t('vehiclesPage.addSuccess');
            alert(successMessage);
        } catch (error: any) {
            console.error('Erro ao salvar veículo:', error);
            alert(error.message || t('vehiclesPage.saveError'));
            throw error;
        }
    }, [selectedVehicle, loadVehicles, t]);

    return {
        vehicles,
        loading,
        error,
        showModal,
        selectedVehicle,
        loggedInCustomerId,
        isLoggedIn,
        loadVehicles,
        handleEdit,
        handleDelete,
        handleAddVehicle,
        handleCloseModal,
        handleSaveVehicle,
    };
}