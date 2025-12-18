import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CompleteCustomerProfile, CustomerRegister } from '../interfaces/Customer';
import http from '../api/http';
import { customerService } from '../services/customerService';
import { useFetchVehicleCounts } from './useVehicles';
import { toast } from './use-toast';

export function useFetchCustomers() {
  const [customers, setCustomers] = useState<CompleteCustomerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetch function that can be called manually
  const fetchAllCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await http.get('/customers/all-profiles');
      setCustomers(response.data);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Could not load customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Expose a refetch function for callers
  return { customers, loading, error, refetch: fetchAllCustomers };
}

// Enhanced hook with all business logic
export function useCustomersPage() {
  const { customers: rawCustomers, loading, error, refetch } = useFetchCustomers();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [clienteToResetPassword, setClienteToResetPassword] = useState<string | null>(null);
  const [selectedCustomerId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFiltro]);

  // Extract customer IDs for vehicle count fetching
  const customerIds = useMemo(() => rawCustomers.map(profile => profile.customer.id), [rawCustomers]);

  // Fetch vehicle counts for all customers
  const { vehicleCounts } = useFetchVehicleCounts(customerIds);

  // Map backend data to a simpler cliente object with vehicle counts
  const clientes = useMemo(() => {
    return rawCustomers.map(profile => ({
      id: profile.customer.id.toString(),
      name: profile.customer.name,
      email: profile.auth.email,
      phone: profile.customer.phone || "N/A",
      address: profile.customer.address || "N/A",
      city: profile.customer.city || "N/A",
      postalCode: profile.customer.postal_code || "N/A",
      status: profile.auth.is_active ? "Ativo" as const : "Inativo" as const,
      //TODO: Change to last_visited when it exists
      lastVisit: profile.customer.updated_at ? new Date(profile.customer.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      vehicles: vehicleCounts[profile.customer.id.toString()] || 0,
    }));
  }, [rawCustomers, vehicleCounts]);

  // Filter customers based on search term and status filter
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch =
        cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.phone.includes(searchTerm);
      const matchesStatus = statusFiltro === "todos" || cliente.status === statusFiltro;
      return matchesSearch && matchesStatus;
    });
  }, [clientes, searchTerm, statusFiltro]);

  // Handlers
  const handleDelete = (id: string) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Implement API call for delete
    if (clienteToDelete) {
      toast({
        title: "Cliente eliminado",
        description: "O cliente foi eliminado com sucesso.",
      });
    }
    setDeleteDialogOpen(false);
    setClienteToDelete(null);
  };

  const handleCreateCustomer = async (customerData: CustomerRegister) => {
    setCreatingCustomer(true);
    try {
      await customerService.register(customerData);
      toast({ title: "Cliente Criado", description: "O novo cliente foi criado com sucesso." });
      setNewCustomerModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Create customer error:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Não foi possível criar o cliente.",
        variant: "destructive",
      });
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleResetPassword = (id: string) => {
    setClienteToResetPassword(id);
    setResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!clienteToResetPassword) return;
    try {
      await customerService.resetPassword(clienteToResetPassword);
      toast({ title: "Password Resetada", description: "A password foi alterada para '12345678'." });
    } catch (error: unknown) {
      console.error('Reset error:', error);
      toast({ title: "Erro", description: "Não foi possível resetar a password.", variant: "destructive" });
    } finally {
      setResetPasswordDialogOpen(false);
      setClienteToResetPassword(null);
    }
  };


  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-PT');

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / pageSize));
  const paginatedClientes = filteredClientes.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return {
    // Data
    paginatedClientes,
    filteredClientes,
    loading,
    error,
    selectedCustomerId,

    // UI State
    searchTerm,
    setSearchTerm,
    statusFiltro,
    setStatusFiltro,
    newCustomerModalOpen,
    setNewCustomerModalOpen,
    creatingCustomer,
    deleteDialogOpen,
    setDeleteDialogOpen,
    resetPasswordDialogOpen,
    setResetPasswordDialogOpen,

    // Pagination
    page,
    setPage,
    totalPages,
    pageSize,

    // Handlers
    handleDelete,
    confirmDelete,
    handleCreateCustomer,
    handleResetPassword,
    confirmResetPassword,
    formatDate,
  };
}