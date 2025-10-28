import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setAuthToken, useAuth } from '../api/auth';
import AccountRelinkModal from './AccountRelinkModal';
import Home from '../pages/Home/Home';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showRelinkModal, setShowRelinkModal] = useState(false);
  const [relinkLoading, setRelinkLoading] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    console.log('=== AUTH CALLBACK DEBUG ===');
    console.log('Type:', type);
    console.log('Error:', error);
    console.log('Token:', token);
    console.log('All params:', Object.fromEntries(searchParams));

    if (error) {
      console.error('Auth error:', error);
      navigate('/register?error=Authentication failed');
      return;
    }

    if (type === 'login' && token) {
      console.log('Login flow');
      setAuthToken(token);
      navigate('/dashboard');
    } else if (type === 'register') {
      console.log('Register flow');
      const provider = searchParams.get('provider') || 'google';
      const authData = {
        token: searchParams.get('token') || '',
        email: searchParams.get('email') || '',
        name: searchParams.get('name') || ''
      };
      
      localStorage.setItem(`${provider}AuthData`, JSON.stringify(authData));
      navigate(`/register?${provider}=true`);
    } else if (type === 'relink') {
      console.log('Relink flow - showing modal');
      setShowRelinkModal(true);
    } else {
      console.log('Unknown type or missing params');
    }
  }, [searchParams, navigate, login]);

  const handleConfirmRelink = async () => {
    try {
      setRelinkLoading(true);
      
      const provider = searchParams.get('provider');
      const providerId = searchParams.get(provider === 'google' ? 'google_id' : 'facebook_id');
      const existingUserId = searchParams.get('existing_user_id');
      
      const response = await fetch('http://localhost:8000/api/v1/customersauth/relink/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          user_id: existingUserId,
          provider_id: providerId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao religar conta');
      }

      const data = await response.json();
      
      // Login with the new token
      setAuthToken(data.access_token);
      
      // Close modal and redirect
      setShowRelinkModal(false);
      navigate('/profile?relinked=success');
      
    } catch (error: any) {
        throw error;
    } finally {
      setRelinkLoading(false);
    }
  };

  const handleCloseRelink = () => {
    setShowRelinkModal(false);
    navigate('/');
  };

  // Get relink data for the modal
  const provider = searchParams.get('provider') as 'google' | 'facebook';
  const providerUserData = {
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || ''
  };
  const existingUserData = {
    name: searchParams.get('existing_user_name') || '',
    email: searchParams.get('existing_user_email') || ''
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Home />

      {/* Relink Modal */}
      <AccountRelinkModal
        isOpen={showRelinkModal}
        onClose={handleCloseRelink}
        onConfirm={handleConfirmRelink}
        provider={provider}
        providerUserData={providerUserData}
        existingUserData={existingUserData}
        loading={relinkLoading}
      />
    </div>
  );
};

export default AuthCallback;