import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import type { CompleteCustomerProfile, CustomerUpdate } from '../interfaces/Customer';
import { useToast } from './use-toast';
import { getErrorMessage } from '../utils/errorHandler';

export function useFetchCustomerById(customerId: string | undefined) {
  const [customerData, setCustomerData] = useState<CompleteCustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setError('No customer ID provided');
      return;
    }
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        // Fetch customer auth info from all-profiles (we'll filter it)
        const allProfilesResponse = await http.get('/customers/all-profiles');
        // Fetch customer's vehicles
        const vehiclesResponse = await http.get(`/vehicles/by_customer/${customerId}`);
        const customerProfile = allProfilesResponse.data.find(
          (profile: CompleteCustomerProfile) => profile.customer.id === parseInt(customerId)
        );

        if (!customerProfile) {
          throw new Error('Customer profile not found');
        }
        const data: CompleteCustomerProfile = {
          auth: customerProfile.auth,
          customer: customerProfile.customer,
          vehicles: vehiclesResponse.data || []
        };

        setCustomerData(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load customer details.'));
        setCustomerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const updateCustomer = async (updatedData: CustomerUpdate) => {
    if (!customerId) return;
    try {
      const response = await http.put(`/customers/${customerId}`, updatedData);
      
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
      return response.data;
    } catch (err) {
      console.error('Failed to update customer:', err);
      throw err;
    }
  };

  return { customerData, loading, error, updateCustomer };
}

// Enhanced hook with all business logic for CustomerDetails page
export function useCustomerDetailsPage(customerId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
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

  const { customerData, loading, error, updateCustomer } = useFetchCustomerById(customerId);

  // Update form data when customer data is loaded
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

  const handleSave = async () => {
    try {
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
      setIsEditing(false);
      toast({
        title: "Alterações salvas",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar os dados do cliente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    // TODO: Implement API call to delete customer
    toast({
      title: "Cliente excluído",
      description: "O cliente foi removido do sistema.",
      variant: "destructive",
    });
    navigate("/customers");
  };

  const handleInputChange = (field: keyof CustomerUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    // Data
    customerData,
    loading,
    error,
    
    // Form state
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
