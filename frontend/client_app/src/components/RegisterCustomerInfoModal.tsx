import React, { useState, useEffect } from 'react';
import { type GoogleAuthData, type FacebookAuthData } from '../api/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  googleData?: GoogleAuthData | null;
  facebookData?: FacebookAuthData | null;
  email?: string;
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
  facebookData,
  email,
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

  // Auto-fill form with Google or Facebook data when available
  useEffect(() => {
    if (googleData) {
      setFormData(prev => ({
        ...prev,
        name: googleData.name || ''
      }));
    } else if (facebookData) {
      setFormData(prev => ({
        ...prev,
        name: facebookData.name || ''
      }));
    }
  }, [googleData, facebookData]);

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

  // Update email logic - use priority: Google > Facebook > Manual input
  const displayEmail = googleData?.email || facebookData?.email || email || '';
  const isEmailDisabled = !!(googleData?.email || facebookData?.email);

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {googleData ? 'Complete Google Registration' : 
           facebookData ? 'Complete Facebook Registration' : 
           'Complete Registration'}
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

          {facebookData && (
            <Alert variant="info" className="mb-3">
              <small>✓ {t('successfully')} {t('authenticated')} {t('with')} {t('facebook')} {t('as')} {facebookData.name}</small>
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='name'>{t('fullName')}</Form.Label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={!!(googleData || facebookData) || loading}
              placeholder={t('enterFullName')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='email'>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              value={displayEmail}
              onChange={() => {}}
              disabled={isEmailDisabled || loading}
              placeholder={t('enterEmail')}
              required
            />
            {isEmailDisabled && (
              <Form.Text className="text-muted">
                {t('email')} {t('from')} {googleData ? 'Google' : 'Facebook'} {t('authentication')}
              </Form.Text>
            )}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='phone'>{t('phoneNumber')}</Form.Label>
            <Form.Control
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterPhoneNumber')}
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
              placeholder={t('enterAddress')}
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
              placeholder={t('enterCity')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='postal_code'>{t('postalCode')}</Form.Label>
            <Form.Control
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterPostalCode')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('birthDate')}</Form.Label>
            <div>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText={t('selectBirthDate')}
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
                {t('selectedDate')}: {selectedDate.toLocaleDateString()}
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
                t('completeRegistration')
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