import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setAuthToken, useAuth } from '../api/auth';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    if (error) {
      console.error('Auth error:', error);
      navigate('/register?error=Authentication failed');
      return;
    }

    if (type === 'login' && token) {
      // User logged in successfully
      setAuthToken(token);
      navigate('/dashboard');
    } else if (type === 'register') {
      // New user, need to complete registration
      const googleData = {
        token: searchParams.get('token') || '',
        email: searchParams.get('email') || '',
        name: searchParams.get('name') || ''
      };
      
      // Store Google data and redirect to register page
      localStorage.setItem('googleAuthData', JSON.stringify(googleData));
      navigate('/register?google=true');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Processing authentication...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;