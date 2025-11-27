import { FaCar, FaTachometerAlt, FaIdCard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatKilometers } from '../utils/formatters';
import type { VehicleCardProps } from '../interfaces/vehicle'; // Importa a interface
import '../styles/VehicleCard.css';
import { Edit, Trash2 } from 'lucide-react';

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const { t } = useTranslation();

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-icon">
          <FaCar size={32} />
        </div>
          <div className="absolute top-2 right-5 d-flex gap-2">
            {onEdit && (
              <button
                className="btn btn-light btn-sm"
                onClick={() => onEdit(vehicle)}
                title={t('vehicleCard.edit')}
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && vehicle.id && (
              <button
                className="btn btn-light btn-sm"
                onClick={() => onDelete(vehicle.id!)}
                title={t('vehicleCard.delete')}
              >
                <Trash2 className="h-4 w-4" />
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