/**
 * Hooks personalizados para gerenciar detalhes de cliente.
 * Inclui busca, atualização e lógica da página de detalhes.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import { useNavigate } from 'react-router-dom';
// Hook para navegação
import http from '../api/http';
// Cliente HTTP
import type { CompleteCustomerProfile, CustomerUpdate } from '../interfaces/Customer';
// Tipos para perfil e atualização de cliente
import { useToast } from './use-toast';
// Hook para notificações
import { getErrorMessage } from '../utils/errorHandler';
// Utilitário para mensagens de erro

// Hook para buscar cliente por ID
export function useFetchCustomerById(customerId: string | undefined) {
  // Estado para dados do cliente
  const [customerData, setCustomerData] = useState<CompleteCustomerProfile | null>(null);
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar cliente quando customerId muda
  useEffect(() => {
    // Se não há customerId, para carregamento
    if (!customerId) {
      setLoading(false);
      setError('No customer ID provided');
      return;
    }
    // Função para buscar cliente
    const fetchCustomer = async () => {
      // Inicia carregamento
      setLoading(true);
      try {
        // Busca todos os perfis
        const allProfilesResponse = await http.get('/customers/all-profiles');
        // Busca veículos do cliente
        const vehiclesResponse = await http.get(`/vehicles/by_customer/${customerId}`);
        // Filtra perfil do cliente
        const customerProfile = allProfilesResponse.data.find(
          (profile: CompleteCustomerProfile) => profile.customer.id === parseInt(customerId)
        );

        // Se não encontra perfil, erro
        if (!customerProfile) {
          throw new Error('Customer profile not found');
        }
        // Monta dados completos
        const data: CompleteCustomerProfile = {
          auth: customerProfile.auth,
          customer: customerProfile.customer,
          vehicles: vehiclesResponse.data || []
        };

        // Define dados
        setCustomerData(data);
        // Limpa erro
        setError(null);
      } catch (err) {
        // Define erro
        setError(getErrorMessage(err, 'Could not load customer details.'));
        // Limpa dados
        setCustomerData(null);
      } finally {
        // Finaliza carregamento
        setLoading(false);
      }
    };

    // Chama busca
    fetchCustomer();
  }, [customerId]);

  // Função para atualizar cliente
  const updateCustomer = async (updatedData: CustomerUpdate) => {
    // Se não há customerId, retorna
    if (!customerId) return;
    try {
      // Faz PUT para atualizar
      const response = await http.put(`/customers/${customerId}`, updatedData);

      // Atualiza estado local
      setCustomerData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          auth: {
            ...prev.auth,
            email: updatedData.email || prev.auth.email
          },
          customer: {
            ...prev.customer,
            ...response.data
          }
        };
      });
      // Retorna dados atualizados
      return response.data;
    } catch (err) {
      // Log erro
      console.error('Failed to update customer:', err);
      // Lança erro
      throw err;
    }
  };

  // Retorna dados e funções
  return { customerData, loading, error, updateCustomer };
}

// Hook aprimorado com lógica completa para página de detalhes de cliente
export function useCustomerDetailsPage(customerId: string | undefined) {
  // Hook de navegação
  const navigate = useNavigate();
  // Hook de toast
  const { toast } = useToast();
  // Estado de edição
  const [isEditing, setIsEditing] = useState(false);
  // Estado dos dados do formulário
  const [formData, setFormData] = useState<CustomerUpdate>({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    address: "",
    country: "",
    city: "",
    postal_code: "",
  });

  // Usa hook de busca
  const { customerData, loading, error, updateCustomer } = useFetchCustomerById(customerId);

  // Efeito para atualizar formulário quando dados carregam
  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.customer.name || "",
        email: customerData.auth.email || "",
        phone: customerData.customer.phone || "",
        birth_date: customerData.customer.birth_date || "",
        address: customerData.customer.address || "",
        country: customerData.customer.country || "",
        city: customerData.customer.city || "",
        postal_code: customerData.customer.postal_code || "",
      });
    }
  }, [customerData]);

  // Função para salvar alterações
  const handleSave = async () => {
    try {
      // Atualiza cliente
      await updateCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birth_date: formData.birth_date,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
      });
      // Para edição
      setIsEditing(false);
      // Mostra sucesso
      toast({
        title: "Alterações salvas",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });
    } catch {
      // Mostra erro
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar os dados do cliente.",
        variant: "destructive",
      });
    }
  };

  // Função para deletar cliente
  const handleDelete = () => {
    // TODO: Implementar chamada à API para deletar cliente
    toast({
      title: "Cliente excluído",
      description: "O cliente foi removido do sistema.",
      variant: "destructive",
    });
    // Navega para lista
    navigate("/customers");
  };

  // Função para alterar input
  const handleInputChange = (field: keyof CustomerUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Retorna dados e handlers
  return {
    // Dados
    customerData,
    loading,
    error,

    // Estado do formulário
    isEditing,
    setIsEditing,
    formData,
    setFormData,

    // Handlers
    handleSave,
    handleDelete,
    handleInputChange,
  };
}
