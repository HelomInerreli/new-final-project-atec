import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';

import { registerWithCredentials, registerWithGoogle, initiateGoogleAuth, type RegisterData, type GoogleAuthData, useAuth } from '../api/auth';
import CustomerInfoModal from './CustomerInfoModal';
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
  
  // Use the auth hook instead of setAuthToken
  const { login } = useAuth();

  // Check for Google auth data on component mount
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
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      setError('Failed to initiate Google authentication');
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
        login(response.access_token); // Use the auth hook's login function
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed');
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
            Create account
          </h2>
        </div>

          <Form onSubmit={handleEmailRegister}>
            {error && (
              <Alert variant="danger" className="text-center">
              {error}
              </Alert>
            )}
          <Form.Group className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label htmlFor='email'>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
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
              Registering...
              </>
              ) : (
                'Register with Email'
              )}
              </Button>

              <div className="text-center my-2">
                <span className="text-muted">or</span>
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
              Register with Google
            </Button>

             <Button 
                type="button" 
                variant="dark" 
                disabled={loading}
                className="mb-2"
                onClick={() => setShowLoginModal(true)}

              >
              Sign in to your existing account
              </Button>
            </div>
          </Form.Group>

        </Form>
        
        {showModal && (
          <CustomerInfoModal
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