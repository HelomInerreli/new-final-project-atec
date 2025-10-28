import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';

interface AccountRelinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  provider: 'google' | 'facebook';
  providerUserData: {
    name: string;
    email: string;
  };
  existingUserData: {
    name: string;
    email: string;
  };
  loading: boolean;
}

const AccountRelinkModal: React.FC<AccountRelinkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  provider,
  providerUserData,
  existingUserData,
  loading
}) => {
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    try {
      setError('');
      await onConfirm();
    } catch (err: any) {
      setError(err.message || 'Erro ao religar conta');
    }
  };

  const providerName = provider === 'google' ? 'Google' : 'Facebook';
  const providerColor = provider === 'google' ? '#4285f4' : '#1877F2';

  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    const firstInitial = names[0]?.[0] || "";
    const lastInitial = names[names.length - 1]?.[0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Religar conta {providerName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <h5>Conta encontrada!</h5>
          <p className="text-muted">
            Já tem uma conta com este email. Deseja religar a sua conta {providerName}?
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Provider Account Info */}
        <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="d-flex align-items-center mb-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: providerColor,
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {getInitials(providerUserData.name)}
            </div>
            <div>
              <h6 className="mb-1">{providerUserData.name}</h6>
              <small className="text-muted">{providerUserData.email}</small>
              <br />
              <small style={{ color: providerColor }}>
                {provider === 'google' && (
                  <>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                      alt="Google"
                      style={{ width: '14px', height: '14px', marginRight: '4px' }}
                    />
                    Conta Google
                  </>
                )}
                {provider === 'facebook' && (
                  <>
                    <i className="bi bi-facebook me-1"></i>
                    Conta Facebook
                  </>
                )}
              </small>
            </div>
          </div>
        </div>

        {/* Existing Account Info */}
        <div className="border rounded p-3 mb-3">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#6c757d',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {getInitials(existingUserData.name)}
            </div>
            <div>
              <h6 className="mb-1">{existingUserData.name}</h6>
              <small className="text-muted">{existingUserData.email}</small>
              <br />
              <small className="text-success">
                <i className="bi bi-check-circle me-1"></i>
                Conta existente
              </small>
            </div>
          </div>
        </div>

        <div className="text-center text-muted">
          <small>
            Ao confirmar, a sua conta {providerName} será religada à conta existente.
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-grid gap-2 w-100">
          <Button 
            variant="primary" 
            onClick={handleConfirm}
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
                A religar...
              </>
            ) : (
              `Religar conta ${providerName}`
            )}
          </Button>
          
          <Button 
            variant="outline-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Criar nova conta
          </Button>
          
          <Button 
            variant="link" 
            onClick={onClose}
            disabled={loading}
            className="text-muted"
          >
            Cancelar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountRelinkModal;