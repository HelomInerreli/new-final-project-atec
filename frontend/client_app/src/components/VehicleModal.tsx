import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCar, FaSave, FaTimes } from 'react-icons/fa';
import type { VehicleModalProps } from '../interfaces/vehicle';
import { useVehicleForm } from '../hooks/useVehicleForm';  // ← Adicione este import
import '../styles/VehicleModal.css';

export function VehicleModal({ show, vehicle, customerId, onClose, onSave }: VehicleModalProps) {
  const { t } = useTranslation();
  // ← Removido: useState, useEffect, estados locais, handlers

  const { formData, errors, loading, handleChange, handleSubmit } = useVehicleForm(vehicle ?? null, customerId, t);  

  const isEditing = !!vehicle?.id;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCar className="me-2" />
          {isEditing ? t('vehicleModal.titleEdit') : t('vehicleModal.titleAdd')}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={(e) => handleSubmit(e, onSave, onClose)}>  {/* ← Ajustado para passar onSave e onClose */}
        <Modal.Body>
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

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            <FaTimes className="me-2" />
            {t('vehicleModal.cancel')}
          </Button>
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