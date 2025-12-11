import { useState, useEffect } from 'react';
import type { CustomerRegister } from '../interfaces/Customer';

export function useNewCustomerModal(isOpen: boolean) {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CustomerRegister>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    birth_date: '',
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        birth_date: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      birth_date: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    setError('');
    return true;
  };

  return {
    formData,
    setFormData,
    error,
    setError,
    handleChange,
    handleDateChange,
    validateForm,
  };
}
