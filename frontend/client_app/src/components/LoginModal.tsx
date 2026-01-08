import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginWithCredentials, useAuth } from '../api/auth';

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  show,
  onClose,
  onSwitchToRegister
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(`${t('please')} ${t('enter')} ${t('email')} ${t('and')} ${t('password')}`);
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await loginWithCredentials({ email, password });
      
      if (response.access_token) {
        login(response.access_token);
        onClose();
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // Navigate after login
        navigate('/my-services');

        // Reload page after successful login
        setTimeout(() => {
          window.location.reload();
        }, 10);
        
      } else {
        setError(`${t('invalid')} ${t('response')} ${t('from')} ${t('server')}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `${t('login')} ${t('failed')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      window.location.href = 'http://localhost:8000/api/v1/customersauth/google';
    } catch (err) {
      setError(`${t('failed')} ${t('to')} initiate ${t('google')} ${t('authentication')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      window.location.href = 'http://localhost:8000/api/v1/customersauth/facebook';
    } catch (err) {
      setError(`${t('failed')} ${t('to')} initiate ${t('facebook')} ${t('authentication')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    onClose();
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate('/register');
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {t('signIn')} {t('to')} {t('your')} {t('account')}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form onSubmit={handleEmailLogin}>
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-2">
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={`${t('enter')} ${t('your')} ${t('email')}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('password')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={`${t('enter')} ${t('your')} ${t('password')}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>
          
          <div className="d-grid gap-1">
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
                  {t('signingIn')}...
                </>
              ) : (
                `${t('signIn')} ${t('with')} ${t('email')}`
              )}
            </Button>
            
            <div className="text-center">
              <span className="text-muted">{t('or')}</span>
            </div>
            
            <Button
              type="button"
              variant="outline-dark"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="d-flex align-items-center justify-content-center mb-1"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google logo"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              {t('signIn')} {t('with')} {t('google')}
            </Button>

            <Button
              type="button"
              variant="outline-dark"
              onClick={handleFacebookLogin}
              disabled={loading}
              className="d-flex align-items-center justify-content-center"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook logo"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              {t('signIn')} {t('with')} {t('facebook')}
            </Button>
          </div>
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/forgot-password')}
              className="text-decoration-none p-0 me-2"
            >
              {t('forgot')} {t('your')} {t('password')}?
            </Button>
          </div>
          
          <hr />
          
          <div className="text-center">
            <span className="text-muted">{t('dontHave')} {t('account')}? </span>
            <Button 
              variant="link" 
              onClick={handleSwitchToRegister}
              className="text-decoration-none p-0 fw-bold"
            >
              {t('create')} {t('one')} {t('here')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;