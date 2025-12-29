import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCar, FaSave, FaTimes } from 'react-icons/fa';
import type { VehicleModalProps } from '../interfaces/vehicle';
import { useVehicleForm } from '../hooks/useVehicleForm';
import '../styles/VehicleModal.css';

/**
 * Modal para adicionar ou editar veículos do cliente
 * Permite inserir matrícula, marca, modelo e quilometragem
 * Valida campos obrigatórios e formatos (matrícula em maiúsculas)
 * @param show - Estado de visibilidade do modal
 * @param vehicle - Objeto com dados do veículo para edição (opcional, null para adicionar novo)
 * @param customerId - ID do cliente proprietário do veículo
 * @param onClose - Função callback para fechar o modal
 * @param onSave - Função callback após guardar com sucesso
 * @returns Componente JSX do modal de veículo
 */
export function VehicleModal({ show, vehicle, customerId, onClose, onSave }: VehicleModalProps) {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Hook customizado para gestão do formulário de veículo
   * Fornece dados do formulário, erros de validação, estado de carregamento e handlers
   * Recebe veículo para edição (ou null para novo), customerId e função de tradução
   */
  const { formData, errors, loading, handleChange, handleSubmit } = useVehicleForm(vehicle ?? null, customerId, t);

  /**
   * Determina se está em modo de edição (veículo existente com ID) ou adição (novo veículo)
   */
  const isEditing = !!vehicle?.id;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      {/* Cabeçalho do modal com título dinâmico (Editar ou Adicionar) */}
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCar className="me-2" />
          {isEditing ? t('vehicleModal.titleEdit') : t('vehicleModal.titleAdd')}
        </Modal.Title>
      </Modal.Header>

      {/* Formulário de veículo com validação */}
      <Form onSubmit={(e) => handleSubmit(e, onSave, onClose)}>
        {/* Corpo do modal com campos do formulário */}
        <Modal.Body>
          {/* Campo de matrícula (obrigatório, maiúsculas, máx 10 caracteres) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('vehicleModal.plate')} *</Form.Label>
            <Form.Control
              type="text"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              placeholder={t('vehicleModal.platePlaceholder')}
              isInvalid={!!errors.plate}
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.plate}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {t('vehicleModal.plateHelper')}
            </Form.Text>
          </Form.Group>

          {/* Campo de marca do veículo (obrigatório, máx 50 caracteres) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('vehicleModal.brand')} *</Form.Label>
            <Form.Control
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder={t('vehicleModal.brandPlaceholder')}
              isInvalid={!!errors.brand}
              maxLength={50}
            />
            <Form.Control.Feedback type="invalid">
              {errors.brand}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Campo de modelo do veículo (obrigatório, máx 50 caracteres) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('vehicleModal.model')} *</Form.Label>
            <Form.Control
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder={t('vehicleModal.modelPlaceholder')}
              isInvalid={!!errors.model}
              maxLength={50}
            />
            <Form.Control.Feedback type="invalid">
              {errors.model}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Campo de quilometragem (obrigatório, numérico, mínimo 0) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('vehicleModal.kilometers')} *</Form.Label>
            <Form.Control
              type="number"
              name="kilometers"
              value={formData.kilometers}
              onChange={handleChange}
              placeholder="0"
              isInvalid={!!errors.kilometers}
              min="0"
            />
            <Form.Control.Feedback type="invalid">
              {errors.kilometers}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Text className="text-muted">
            * {t('vehicleModal.requiredFields')}
          </Form.Text>
        </Modal.Body>

        {/* Rodapé do modal com botões de cancelar e guardar */}
        <Modal.Footer>
          {/* Botão de cancelar */}
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            <FaTimes className="me-2" />
            {t('vehicleModal.cancel')}
          </Button>
          {/* Botão de guardar com spinner durante carregamento */}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t('vehicleModal.saving')}
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {t('vehicleModal.save')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}