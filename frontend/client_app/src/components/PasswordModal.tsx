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
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem');
      return;
    }

    if (!isCreating && !currentPassword) {
      setError('Por favor, insira a palavra-passe atual');
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
      setError(err.message || 'Erro ao processar palavra-passe');
    }
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isCreating ? 'Criar Palavra-passe' : 'Alterar Palavra-passe'}
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
            <Form.Group className="mb-3">
              <Form.Label htmlFor="currentPassword">Palavra-passe Atual</Form.Label>
              <Form.Control
                type="password"
                id="currentPassword"
                placeholder="Digite a sua palavra-passe atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={!isCreating}
                disabled={loading}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label htmlFor="newPassword">
              {isCreating ? 'Nova Palavra-passe' : 'Nova Palavra-passe'}
            </Form.Label>
            <Form.Control
              type="password"
              id="newPassword"
              placeholder="Digite a nova palavra-passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            <Form.Text className="text-muted">
              A palavra-passe deve ter pelo menos 6 caracteres
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label htmlFor="confirmPassword">Confirmar Palavra-passe</Form.Label>
            <Form.Control
              type="password"
              id="confirmPassword"
              placeholder="Confirme a nova palavra-passe"
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
                  A processar...
                </>
              ) : (
                isCreating ? 'Criar Palavra-passe' : 'Alterar Palavra-passe'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PasswordModal;