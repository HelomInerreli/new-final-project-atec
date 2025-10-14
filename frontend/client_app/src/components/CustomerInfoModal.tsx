import React, { useState, useEffect } from 'react';
import { type GoogleAuthData } from '../api/auth';

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  googleData: GoogleAuthData | null;
  loading: boolean;
}

interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string; // Add this
}

const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  googleData,
  loading
}) => {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    birth_date: '' // Initialize birth_date
  });

  // Auto-fill form with Google data when available
  useEffect(() => {
    if (googleData) {
      setFormData(prev => ({
        ...prev,
        name: googleData.name || ''
      }));
    }
  }, [googleData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border border-black w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">
              Complete Your Registration
            </h3>
            <button
              onClick={onClose}
              className="text-black hover:text-red-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {googleData && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-md">
              <p className="text-sm text-green-700 font-semibold">
                ✓ Successfully authenticated with Google as {googleData.email}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-black">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                disabled={!!googleData} // Disable if Google data exists
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-black">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-black">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-bold text-black">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <div>
                <label htmlFor="postal_code" className="block text-sm font-bold text-black">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birth_date" className="block text-sm font-bold text-black">
                Birth Date
              </label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-red-600 rounded text-sm font-bold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded text-sm font-bold text-white bg-black hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoModal;