import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerWithCredentials, registerWithGoogle, initiateGoogleAuth, type RegisterData, type GoogleAuthData, setAuthToken } from '../api/auth';
import CustomerInfoModal from './CustomerInfoModal';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [googleData, setGoogleData] = useState<GoogleAuthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

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
      const { url } = await initiateGoogleAuth();
      
      const popup = window.open(url, 'google-auth', 'width=500,height=600');
      
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          popup?.close();
          setGoogleData(event.data.data);
          setShowModal(true);
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
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
        setAuthToken(response.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-4xl font-bold text-black mb-2">
            Create account
          </h2>
          <p className="text-center text-lg text-black mb-6">Or</p>
          <button onClick={() => navigate('/login')} className="w-full bg-black text-white font-bold py-3 rounded mb-6 text-lg">
            sign in to your existing account
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={handleEmailRegister}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center font-semibold">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-black font-medium mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-black font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-black font-medium mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded text-lg">
              Continue with Email
            </button>
            
            <div className="text-center">
              <span className="text-black font-semibold">or</span>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full min-h-[56px] bg-white rounded-full border border-gray-300 flex items-center px-6 py-2 hover:border-black transition disabled:opacity-50"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google logo"
                className="w-7 h-7 mr-4"
              />
              <span className="flex-1 text-center text-black text-lg font-semibold">Continue with Google</span>
            </button>
          </div>
        </form>
        
        {showModal && (
          <CustomerInfoModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCompleteRegistration}
            googleData={googleData}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Register;