/**
 * Hook personalizado para gerenciar modal de novo cliente.
 * Permite gerenciar formulário, validação e estado do modal.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import type { CustomerRegister } from '../interfaces/Customer';
// Tipo para registro de cliente

/**
 * Hook para gerenciar modal de novo cliente.
 * @param isOpen - Se o modal está aberto
 * @returns Estado e funções para o modal
 */
export function useNewCustomerModal(isOpen: boolean) {
  // Estado de erro
  const [error, setError] = useState('');
  // Estado dos dados do formulário
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

  // Efeito para bloquear scroll do body quando modal abre
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

  // Efeito para resetar formulário quando modal fecha
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

  // Função para lidar com mudança de input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para lidar com mudança de data
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      birth_date: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  // Função para validar formulário
  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    setError('');
    return true;
  };

  // Retorna estado e funções
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