import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setAuthToken, useAuth } from '../api/auth';
import AccountRelinkModal from './AccountRelinkModal';

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
      const provider = searchParams.get('provider') || 'google';
      const authData = {
        token: searchParams.get('token') || '',
        email: searchParams.get('email') || '',
        name: searchParams.get('name') || ''
      };
      
      // Store auth data and redirect to register page
      localStorage.setItem(`${provider}AuthData`, JSON.stringify(authData));
      navigate(`/register?${provider}=true`);
    } else if (type === 'relink') {
      // Show relink modal
      setShowRelinkModal(true);
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

  const handleCreateNewAccount = () => {
    // Convert to registration flow
    const provider = searchParams.get('provider') || 'google';
    const authData = {
      token: searchParams.get(provider === 'google' ? 'google_id' : 'facebook_id') || '',
      email: searchParams.get('email') || '',
      name: searchParams.get('name') || ''
    };
    
    // Store auth data and redirect to register
    localStorage.setItem(`${provider}AuthData`, JSON.stringify(authData));
    setShowRelinkModal(false);
    navigate(`/register?${provider}=true`);
  };

  const handleCancelRelink = () => {
    setShowRelinkModal(false);
    navigate('/login');
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
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Processing authentication...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>

      {/* Relink Modal */}
      <AccountRelinkModal
        isOpen={showRelinkModal}
        onClose={handleCancelRelink}
        onConfirm={handleConfirmRelink}
        onCancel={handleCreateNewAccount}
        provider={provider}
        providerUserData={providerUserData}
        existingUserData={existingUserData}
        loading={relinkLoading}
      />
    </div>
  );
};

export default AuthCallback;