import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { registerWithCredentials, registerWithGoogle, initiateGoogleAuth, type RegisterData, type GoogleAuthData, useAuth } from '../api/auth';
import RegisterCustomerInfoModal from './RegisterCustomerInfoModal';
import LoginModal from './LoginModal';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [googleData, setGoogleData] = useState<GoogleAuthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const isGoogleAuth = searchParams.get('google');
    if (isGoogleAuth) {
      const storedGoogleData = localStorage.getItem('googleAuthData');
      if (storedGoogleData) {
        const googleData = JSON.parse(storedGoogleData);
        setGoogleData(googleData);
        setShowModal(true);
        localStorage.removeItem('googleAuthData'); // Clean up
      }
    }
  }, [searchParams]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError(`${t('passwords')} ${t('do')} ${t('not')} ${t('match')}`);
      return;
    }
    
    if (password.length < 6) {
      setError(`${t('password')} ${t('must')} ${t('be')} ${t('at')} ${t('least')} 6 ${t('characters')}`);
      return;
    }
    
    setError('');
    setGoogleData(null);
    setShowModal(true);
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      // Redirect to backend Google OAuth
      window.location.href = 'http://localhost:8000/api/v1/customersauth/google';
    } catch (err) {
      setError(`${t('failed')} ${t('to')} initiate ${t('google')} ${t('authentication')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (customerData: Omit<RegisterData, 'email' | 'password'>) => {
    try {
      setLoading(true);
      
      let response;
      if (googleData) {
        // For Google registration, merge Google data with customer data
        // Remove name from customerData since we're using Google's name
        const { name, ...restCustomerData } = customerData;
        response = await registerWithGoogle({
          token: googleData.token,
          email: googleData.email,
          name: googleData.name, // Use Google's name
          ...restCustomerData // This will add phone, address, etc. without name
        });
      } else {
        // Register with email/password
        response = await registerWithCredentials({
          email,
          password,
          ...customerData
        });
      }
      
      if (response.access_token) {
        login(response.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || `${t('registration')} ${t('failed')}`);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <div>
          <h2 className="text-center fw-bold">
            {t('createAccount')}
          </h2>
        </div>

        <Form onSubmit={handleEmailRegister}>
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor='email'>{t('email')}</Form.Label>
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
            <Form.Label htmlFor="password">{t('password')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={`${t('enter')} ${t('your')} ${t('password')}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="confirmPassword">{t('confirmPassword')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={`${t('confirmPassword')}`}
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
                  {t('registering')}...
                </>
              ) : (
                `${t('register')} ${t('with')} ${t('email')}`
              )}
            </Button>

            <div className="text-center my-2">
              <span className="text-muted">{t('or')}</span>
            </div>

            <Button
              type="button"
              variant="outline-dark"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="d-flex align-items-center justify-content-center mb-3"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google logo"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              {t('register')} {t('with')} {t('google')}
            </Button>

            <Button 
              type="button" 
              variant="dark" 
              disabled={loading}
              className="mb-2"
              onClick={() => setShowLoginModal(true)}
            >
              {t('signInToExistingAccount')}
            </Button>
          </div>
        </Form>
        
        {showModal && (
          <RegisterCustomerInfoModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCompleteRegistration}
            googleData={googleData}
            loading={loading}
          />
        )}
        
        <LoginModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    </div>
  );
};

export default Register;