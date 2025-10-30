import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import './../styles/RedButton.css';
interface EditCustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  initialData: CustomerInfo;
  loading: boolean;
}

interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birthDate?: string;
}

const EditCustomerInfoModal: React.FC<EditCustomerInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CustomerInfo>(initialData);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialData.birthDate ? new Date(initialData.birthDate) : null
  );
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(initialData);
    setSelectedDate(initialData.birthDate ? new Date(initialData.birthDate) : null);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {

    setSelectedDate(date);

    let dateString = '';
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
      setFormData(prev => ({
        ...prev,
        birth_date: dateString
      }));
    }
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(`${t('name')} ${t('is')} ${t('required')}`);
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('profilePage.editProfile')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>{t('fullName')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('phoneNumber')}</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('address')}</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('city')}</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('postalCode')}</Form.Label>
            <Form.Control
              type="text"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('country')}</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('birthDate')}</Form.Label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              minDate={new Date(1924, 0, 1)}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              className="form-control"
              disabled={loading}
              isClearable
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" disabled={loading} className="red-hover-btn">
              {loading ? <Spinner animation="border" size="sm" color="red"/> : t('save')}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditCustomerInfoModal;