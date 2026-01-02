import { FaCar, FaTachometerAlt, FaIdCard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatKilometers } from '../utils/formatters';
import type { VehicleCardProps } from '../interfaces/vehicle'; // Importa a interface
import '../styles/VehicleCard.css';
import { Edit, Trash2 } from 'lucide-react';

/**
 * Componente de card para exibir informações de um veículo
 * Apresenta marca, modelo, matrícula e quilometragem
 * Inclui botões de edição e eliminação (opcionais)
 * @param vehicle - Objeto com dados do veículo (marca, modelo, matrícula, quilómetros)
 * @param onEdit - Função callback para editar o veículo (opcional)
 * @param onDelete - Função callback para eliminar o veículo (opcional)
 * @returns Componente JSX do card de veículo
 */
export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  return (
    <div className="vehicle-card">
      {/* Cabeçalho do card com ícone e botões de ação */}
      <div className="vehicle-card-header">
        {/* Ícone de veículo */}
        <div className="vehicle-icon">
          <FaCar size={32} />
        </div>
          {/* Botões de edição e eliminação */}
          <div className="absolute top-2 right-5 d-flex gap-2">
            {/* Botão de edição (exibido apenas se onEdit fornecido) */}
            {onEdit && (
              <button
                className="btn btn-light btn-sm"
                onClick={() => onEdit(vehicle)}
                title={t('vehicleCard.edit')}
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {/* Botão de eliminação (exibido apenas se onDelete fornecido e veículo tem ID) */}
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

      {/* Corpo do card com informações do veículo */}
      <div className="vehicle-card-body">
        {/* Título com marca e modelo */}
        <h3 className="vehicle-title">
          <FaCar className="me-2" />
          {vehicle.brand} {vehicle.model}
        </h3>

        {/* Seção de informações detalhadas (matrícula e quilómetros) */}
        <div className="vehicle-info">
          {/* Informação da matrícula */}
          <div className="info-item">
            <FaIdCard className="info-icon" />
            <div>
              <span className="info-label">{t('vehicleCard.plate')}</span>
              <span className="info-value">{vehicle.plate}</span>
            </div>
          </div>

          {/* Informação dos quilómetros */}
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