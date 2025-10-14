import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginWithCredentials, setAuthToken, type LoginData } from '../api/auth';

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await loginWithCredentials({ email, password });
      
      if (response.access_token) {
        setAuthToken(response.access_token);
        onClose(); // Close modal
        navigate('/dashboard');
        // Clear form
        setEmail('');
        setPassword('');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
        <Modal.Title className="fw-bold">Sign in to your account</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form onSubmit={handleEmailLogin}>
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
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
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                'Sign in with Email'
              )}
            </Button>
            
            <div className="text-center my-2">
              <span className="text-muted">or</span>
            </div>
            
            <Button
              type="button"
              variant="outline-dark"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="d-flex align-items-center justify-content-center mb-3"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google logo"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              Sign in with Google
            </Button>
          </div>
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/forgot-password')}
              className="text-decoration-none p-0 me-3"
            >
              Forgot your password?
            </Button>
          </div>
          
          <hr />
          
          <div className="text-center">
            <span className="text-muted">Don't have an account? </span>
            <Button 
              variant="link" 
              onClick={handleSwitchToRegister}
              className="text-decoration-none p-0 fw-bold"
            >
              Create one here
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;