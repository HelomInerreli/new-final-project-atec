import { VehicleCard } from '../../components/VehicleCard';
import { VehicleModal } from '../../components/VehicleModal';
import { FaPlus, FaCar } from 'react-icons/fa';
import { useVehicles } from '../../hooks/useVehicles';
import '../../styles/Vehicles.css';
import { useTranslation } from 'react-i18next';

/**
 * Componente de página para gestão de veículos do cliente
 * Exibe lista de veículos cadastrados com opções de adicionar, editar e eliminar
 * Apresenta estados de loading, erro e lista vazia com mensagens apropriadas
 * Permite adicionar novos veículos e editar existentes através de modal
 * Requer autenticação - exibe alerta se utilizador não autenticado
 * @returns Componente JSX da página de veículos
 */
export function Vehicles() {
  /**
   * Hook customizado para gestão completa de veículos
   * Fornece: lista de veículos, estados de UI, informações de autenticação e handlers
   * - vehicles: array de veículos do cliente
   * - loading: estado de carregamento
   * - error: mensagem de erro se houver
   * - showModal: controle de visibilidade do modal
   * - selectedVehicle: veículo selecionado para edição (null para novo)
   * - loggedInCustomerId: ID do cliente autenticado
   * - isLoggedIn: estado de autenticação
   * - loadVehicles: função para recarregar lista
   * - handleEdit: handler para editar veículo
   * - handleDelete: handler para eliminar veículo
   * - handleAddVehicle: handler para abrir modal de adição
   * - handleCloseModal: handler para fechar modal
   * - handleSaveVehicle: handler para salvar veículo (criar ou atualizar)
   */
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
    handleGetFromAPI,
  } = useVehicles();

  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

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

  /**
   * Flag para determinar se cliente possui veículos cadastrados
   * Utilizada para renderizar lista de veículos ou mensagem de lista vazia
   */
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
        getFromAPI={handleGetFromAPI}
      />
    </div>
  );
}

export default Vehicles;