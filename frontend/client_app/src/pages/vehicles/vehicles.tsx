import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../api/auth';
import { VehicleCard } from '../../components/VehicleCard';
import { VehicleModal } from '../../components/VehicleModal';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaCar } from 'react-icons/fa';
import type { Vehicle } from '../../interfaces/vehicle'; // MUDOU: import type
import { vehicleService } from '../../services/vehicleServices';
import { ClientMenu } from '../../components/ClientMenu';
import '../../styles/Vehicles.css';

export function Vehicles() {
  const { t } = useTranslation();
  const { loggedInCustomerId, isLoggedIn } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const loadVehicles = useCallback(async () => {
    if (!loggedInCustomerId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getByCustomer(loggedInCustomerId);
      setVehicles(data);
    } catch (error: any) {
      console.error('Erro ao carregar veículos:', error);
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

  if (!isLoggedIn) {
    return (
      <div className="vehicles-page">
        <div className="alert alert-warning">
          {t('vehiclesPage.pleaseLogin')}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vehicles-page">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
          <p className="mt-3">{t('vehiclesPage.loading')}</p>
        </div>
      </div>
    );
  }

  const hasVehicles = vehicles.length > 0;

  return (
    <div className="vehicles-page">
      <ClientMenu />
      <div className="vehicles-header">
        <h1>{t('vehiclesPage.title')}</h1>
        <button className="btn btn-primary" onClick={handleAddVehicle}>
          <FaPlus /> {t('vehiclesPage.addVehicle')}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>{t('vehiclesPage.errorLoading')}:</strong> {error}
          <br />
          <small>{t('vehiclesPage.customerIdLabel')} {loggedInCustomerId}</small>
          <br />
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={loadVehicles}>
            {t('vehiclesPage.tryAgain')}
          </button>
        </div>
      )}

      {!error && !hasVehicles ? (
        <div className="no-vehicles">
          <FaCar size={60} color="#ccc" />
          <h3>{t('vehiclesPage.noVehicles')}</h3>
          <p>{t('vehiclesPage.noVehiclesMessage')}</p>
          <button className="btn btn-primary" onClick={handleAddVehicle}>
            <FaPlus /> {t('vehiclesPage.addVehicle')}
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <VehicleModal
        show={showModal}
        vehicle={selectedVehicle}
        customerId={loggedInCustomerId!}
        onClose={handleCloseModal}
        onSave={handleSaveVehicle}
      />
    </div>
  );
}

export default Vehicles;