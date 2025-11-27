import { VehicleCard } from '../../components/VehicleCard';
import { VehicleModal } from '../../components/VehicleModal';
import { FaPlus, FaCar } from 'react-icons/fa';
import { useVehicles } from '../../hooks/useVehicles';
import '../../styles/Vehicles.css';
import { useTranslation } from 'react-i18next';

export function Vehicles() {
  const {
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
  } = useVehicles();

  const { t } = useTranslation(); // Assuming useTranslation is imported

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
        <button className="btn btn-danger" onClick={handleAddVehicle}>
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