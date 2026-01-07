import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Interface para as propriedades do modal de relink de conta
interface AccountRelinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
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

// Componente do modal para relink de conta
const AccountRelinkModal: React.FC<AccountRelinkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  provider,
  existingUserData,
  loading
}) => {
  const { t } = useTranslation();
  // Estado para erro
  const [error, setError] = useState('');

  // Função para confirmar o relink
  const handleConfirm = async () => {
    try {
      setError('');
      await onConfirm();
    } catch (err: any) {
      setError(err.message || t('relink.error'));
    }
  };

  const providerName = provider === 'google' ? 'Google' : 'Facebook';
  const buttonColor = provider === 'google' ? '#595959ff' : '#307bddff';

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    const firstInitial = names[0]?.[0] || "";
    const lastInitial = names[names.length - 1]?.[0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Renderiza o modal
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {t('relink.title', { provider: providerName })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <h5>{t('relink.accountFound')}</h5>
          <p className="text-muted">
            {t('relink.question', { provider: providerName })}
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Existing Account Info */}
        <div className="border rounded p-4 mb-1">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              {getInitials(existingUserData.name)}
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1">{existingUserData.name}</h5>
              <p className="text-muted mb-1">{existingUserData.email}</p>
              <small className="text-success">
                <i className="bi bi-check-circle me-1"></i>
                {t('relink.existingAccount')}
              </small>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-grid gap-2 w-100">
          <Button 
            onClick={handleConfirm}
            disabled={loading}
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: buttonColor,
              borderColor: buttonColor,
              color: 'white'
            }}
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
                {t('relink.linking')}
              </>
            ) : (
              <>
                {provider === 'google' && (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    alt="Google"
                    style={{ width: '16px', height: '16px', marginRight: '8px' }}
                  />
                )}
                {provider === 'facebook' && (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                    alt="Facebook"
                    style={{ width: '20px', height: '20px', marginRight: '7px' }}
                  />
                )}
                {t('relink.button', { provider: providerName })}
              </>
            )}
          </Button>
          
          <Button 
            variant="link" 
            onClick={onClose}
            disabled={loading}
            className="text-muted"
          >
            {t('cancel')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountRelinkModal;