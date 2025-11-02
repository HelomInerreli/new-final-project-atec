import { FaCar, FaEdit, FaTrash, FaTachometerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../styles/VehicleCard.css';

interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  customer_id: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: number) => void;
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const { t, i18n } = useTranslation();

  // Formatar números de acordo com o idioma atual
  const formatKilometers = (km: number) => {
    return km.toLocaleString(i18n.language === 'pt' ? 'pt-PT' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US');
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-icon">
          <FaCar size={40} />
        </div>
        <div className="vehicle-actions">
          {onEdit && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(vehicle)}
              title={t('vehicleCard.edit')}
            >
              <FaEdit />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(vehicle.id)}
              title={t('vehicleCard.delete')}
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      
      <div className="vehicle-card-body">
        <h3 className="vehicle-title">
          {vehicle.brand} {vehicle.model}
        </h3>
        
        <div className="vehicle-info">
          <div className="info-item">
            <span className="info-label">{t('vehicleCard.plate')}</span>
            <span className="info-value">{vehicle.plate}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">
              <FaTachometerAlt /> {t('vehicleCard.kilometers')}
            </span>
            <span className="info-value">{formatKilometers(vehicle.kilometers)} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}