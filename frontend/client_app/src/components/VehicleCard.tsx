import { FaCar, FaTachometerAlt, FaIdCard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatKilometers } from '../utils/formatters';
import type { VehicleCardProps } from '../interfaces/vehicle'; // Importa a interface
import '../styles/VehicleCard.css';

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const { t } = useTranslation();

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-icon">
          <FaCar size={32} />
        </div>
        <div className="vehicle-actions">
          {onEdit && (
            <button
              className="btn btn-light btn-sm action-btn edit-btn"
              onClick={() => onEdit(vehicle)}
              title={t('vehicleCard.edit')}
            >
              <i className="bi bi-pencil-fill text-warning"></i>
            </button>
          )}
          {onDelete && vehicle.id && (
            <button
              className="btn btn-light btn-sm action-btn delete-btn"
              onClick={() => onDelete(vehicle.id!)}
              title={t('vehicleCard.delete')}
            >
              <i className="bi bi-pencil-fill text-danger"></i>
            </button>
          )}
        </div>
      </div>

      <div className="vehicle-card-body">
        <h3 className="vehicle-title">
          <FaCar className="me-2" />
          {vehicle.brand} {vehicle.model}
        </h3>

        <div className="vehicle-info">
          <div className="info-item">
            <FaIdCard className="info-icon" />
            <div>
              <span className="info-label">{t('vehicleCard.plate')}</span>
              <span className="info-value">{vehicle.plate}</span>
            </div>
          </div>

          <div className="info-item">
            <FaTachometerAlt className="info-icon" />
            <div>
              <span className="info-label">{t('vehicleCard.kilometers')}</span>
              <span className="info-value">{formatKilometers(vehicle.kilometers)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}