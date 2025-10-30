import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (passwordData: { currentPassword?: string; newPassword: string }) => Promise<void>;
    isCreating: boolean;
    loading: boolean;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  loading
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError(t('passwordModal.minLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordModal.mismatch'));
      return;
    }

    if (!isCreating && !currentPassword) {
      setError(t('passwordModal.requiredCurrent'));
      return;
    }

    try {
      const passwordData = isCreating 
        ? { newPassword }
        : { currentPassword, newPassword };
      
      await onSubmit(passwordData);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || t('passwordModal.error'));
    }
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isCreating ? t('passwordModal.titleCreate') : t('passwordModal.titleChange')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {!isCreating && (
            <Form.Group className="mb-5">
              <Form.Label htmlFor="currentPassword">{t('passwordModal.current')}</Form.Label>
              <Form.Control
                type="password"
                id="currentPassword"
                placeholder={t('passwordModal.placeholderCurrent')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={!isCreating}
                disabled={loading}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label htmlFor="newPassword">
              {isCreating ? t('passwordModal.new') : t('passwordModal.new')}
            </Form.Label>
            <Form.Control
              type="password"
              id="newPassword"
              placeholder={t('passwordModal.placeholderNew')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            <Form.Text className="text-muted">
              {t('passwordModal.minLength')}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="confirmPassword">{t('passwordModal.confirm')}</Form.Label>
            <Form.Control
              type="password"
              id="confirmPassword"
              placeholder={t('passwordModal.placeholderConfirm')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              type="submit" 
              variant="dark" 
              className="red-hover-btn"
              disabled={loading}
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
                  {t('passwordModal.processing')}
                </>
              ) : (
                isCreating ? t('passwordModal.titleCreate') : t('passwordModal.titleChange')
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline-secondary" 
              onClick={handleClose}
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

export default PasswordModal;