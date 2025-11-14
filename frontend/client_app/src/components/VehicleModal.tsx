import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCar, FaSave, FaTimes } from 'react-icons/fa';
import type { Vehicle } from '../interfaces/vehicle'; // MUDOU DE services para interfaces
import '../styles/VehicleModal.css';

interface VehicleModalProps {
  show: boolean;
  vehicle?: Vehicle | null;
  customerId: number;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => Promise<void>;
}

export function VehicleModal({ show, vehicle, customerId, onClose, onSave }: VehicleModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Vehicle>({
    plate: '',
    brand: '',
    model: '',
    kilometers: 0,
    customer_id: customerId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!vehicle?.id;

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        customer_id: vehicle.customer_id || customerId, // Garantir que customer_id está presente
      });
    } else {
      setFormData({
        plate: '',
        brand: '',
        model: '',
        kilometers: 0,
        customer_id: customerId,
      });
    }
    setErrors({});
  }, [vehicle, show, customerId]); // Adicionado customerId nas dependências

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kilometers' ? parseInt(value) || 0 : value.toUpperCase(),
    }));
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plate.trim()) {
      newErrors.plate = t('vehicleModal.errors.plateRequired');
    } else if (!/^[A-Z0-9-]{6,10}$/.test(formData.plate)) {
      newErrors.plate = t('vehicleModal.errors.plateInvalid');
    }

    if (!formData.brand.trim()) {
      newErrors.brand = t('vehicleModal.errors.brandRequired');
    }

    if (!formData.model.trim()) {
      newErrors.model = t('vehicleModal.errors.modelRequired');
    }

    if (formData.kilometers < 0) {
      newErrors.kilometers = t('vehicleModal.errors.kilometersInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        customer_id: customerId, // Garantir que customer_id está sempre presente
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      // Não fechar o modal se houver erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCar className="me-2" />
          {isEditing ? t('vehicleModal.titleEdit') : t('vehicleModal.titleAdd')}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
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