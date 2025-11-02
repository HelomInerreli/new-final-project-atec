import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../api/auth';
import { VehicleCard } from '../../components/VehicleCard';
import { VehicleModal } from '../../components/VehicleModal';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaCar } from 'react-icons/fa';
import '../../styles/Vehicles.css';

interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  customer_id: number;
  deleted_at?: string | null;
}

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
      
      const response = await fetch(`${API_BASE_URL}/vehicles/by_customer/${loggedInCustomerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(t('vehiclesPage.errorLoading'));
      }
      
      const data = await response.json();
      
      // Filtrar apenas veículos que não foram deletados (deleted_at é null)
      const activeVehicles = data.filter((vehicle: Vehicle) => !vehicle.deleted_at);
      setVehicles(activeVehicles);
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
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(t('vehiclesPage.deleteError'));
      }

      // Remover o veículo da lista local (soft delete)
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

  const handleSaveVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id' | 'deleted_at'>) => {
    try {
      const isEditing = !!selectedVehicle?.id;
      const url = isEditing 
        ? `${API_BASE_URL}/vehicles/${selectedVehicle.id}`
        : `${API_BASE_URL}/vehicles/`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t('vehiclesPage.saveError'));
      }

      // Recarregar a lista de veículos
      await loadVehicles();
      
      const successMessage = isEditing 
        ? t('vehiclesPage.updateSuccess') 
        : t('vehiclesPage.addSuccess');
      alert(successMessage);
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      alert(error.message || t('vehiclesPage.saveError'));
      throw error; // Re-throw para o modal saber que houve erro
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