import React, { useState, useEffect } from 'react';
import { type GoogleAuthData } from '../api/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  googleData: GoogleAuthData | null;
  loading: boolean;
}

interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
}

const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  googleData,
  loading
}) => {
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    birth_date: ''
  });

  const { t } = useTranslation();

  // Auto-fill form with Google data when available
  useEffect(() => {
    if (googleData) {
      setFormData(prev => ({
        ...prev,
        name: googleData.name || ''
      }));
    }
  }, [googleData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError(`${t('name')} ${t('is')} ${t('required')}`);
      return;
    }
    
    // Convert selected date to string format and include in form data
    const finalFormData = {
      ...formData,
      birth_date: selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    };
    
    setError(''); // Clear any previous errors
    onSubmit(finalFormData); // Submit the updated form data with the date
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    // Also update the formData for consistency
    setFormData(prev => ({
      ...prev,
      birth_date: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {t('complete')} {t('your')} {t('registration')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}
          
          {googleData && (
            <Alert variant="success" className="mb-3">
              <small>✓ {t('successfully')} {t('authenticated')} {t('with')} {t('google')} {t('as')} {googleData.email}</small>
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='name'>{t('full')} {t('name')} *</Form.Label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={!!googleData || loading}
              placeholder={`${t('enter')} ${t('your')} ${t('full')} ${t('name')}`}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='phone'>{t('phone')} {t('number')}</Form.Label>
            <Form.Control
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={`${t('enter')} ${t('your')} ${t('phone')} ${t('number')}`}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='address'>{t('address')}</Form.Label>
            <Form.Control 
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={`${t('enter')} ${t('your')} ${t('address')}`}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='city'>{t('city')}</Form.Label>
            <Form.Control
              type="text"
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={`${t('enter')} ${t('your')} ${t('city')}`}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='postal_code'>{t('postal')} {t('code')}</Form.Label>
            <Form.Control
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={`${t('enter')} ${t('your')} ${t('postal')} ${t('code')}`}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('birth')} {t('date')}</Form.Label>
            <div>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText={`${t('select')} ${t('your')} ${t('birth')} ${t('date')}`}
                showPopperArrow={false}
                maxDate={new Date()} 
                minDate={new Date(1924, 0, 1)} 
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                className="form-control"
                disabled={loading}
                popperPlacement="bottom-start"
                autoComplete="off"
                isClearable
                wrapperClassName="d-block" 
              />
            </div>
            {selectedDate && (
              <Form.Text className="text-muted">
                {t('select')}ed: {selectedDate.toLocaleDateString('en-GB')}
              </Form.Text>
            )}
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              type="submit" 
              variant="dark" 
              disabled={loading}
              className="mb-2"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {t('creating')} {t('account')}...
                </>
              ) : (
                `${t('complete')} ${t('registration')}`
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerInfoModal;