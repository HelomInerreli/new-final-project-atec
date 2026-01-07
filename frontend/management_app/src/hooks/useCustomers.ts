/**
 * Hooks personalizados para gerenciar clientes.
 * Inclui busca, filtragem, criação e operações relacionadas.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
// Importa hooks do React
import type { CompleteCustomerProfile, CustomerRegister } from '../interfaces/Customer';
// Tipos para perfil e registo de cliente
import http from '../api/http';
// Cliente HTTP
import { customerService } from '../services/customerService';
// Serviço para clientes
import { useFetchVehicleCounts } from './useVehicles';
// Hook para contar veículos
import { toast } from './use-toast';
// Hook para notificações
import { getErrorMessage } from '../utils/errorHandler';
// Utilitário para mensagens de erro

// Hook para buscar todos os clientes
export function useFetchCustomers() {
  // Estado para lista de clientes
  const [customers, setCustomers] = useState<CompleteCustomerProfile[]>([]);
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Função para buscar clientes, memoizada
  const fetchAllCustomers = useCallback(async () => {
    // Inicia carregamento
    setLoading(true);
    try {
      // Faz requisição GET
      const response = await http.get('/customers/all-profiles');
      // Define clientes
      setCustomers(response.data);
      // Limpa erro
      setError(null);
    } catch (err) {
      // Define erro
      setError(getErrorMessage(err, 'Could not load customer data. Please try again.'));
    } finally {
      // Finaliza carregamento
      setLoading(false);
    }
  }, []);

  // Efeito para carregamento inicial
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Expõe função de refetch
  return { customers, loading, error, refetch: fetchAllCustomers };
}

// Hook aprimorado com toda a lógica de negócio para página de clientes
export function useCustomersPage() {
  // Usa hook de busca
  const { customers: rawCustomers, loading, error, refetch } = useFetchCustomers();

  // Estado da UI
  const [searchTerm, setSearchTerm] = useState("");
  // Filtro de status
  const [statusFiltro, setStatusFiltro] = useState("todos");
  // Modal de novo cliente
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  // Estado de criação
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  // Dialog de delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // Cliente a deletar
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  // Dialog de reset password
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  // Cliente para reset
  const [clienteToResetPassword, setClienteToResetPassword] = useState<string | null>(null);
  // Cliente selecionado
  const [selectedCustomerId] = useState<number | null>(null);
  // Página atual
  const [page, setPage] = useState<number>(1);
  // Tamanho da página
  const pageSize = 10;

  // Efeito para resetar página quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFiltro]);

  // Extrai IDs de clientes para buscar contagens de veículos
  const customerIds = useMemo(() => rawCustomers.map(profile => profile.customer.id), [rawCustomers]);

  // Busca contagens de veículos
  const { vehicleCounts } = useFetchVehicleCounts(customerIds);

  // Mapeia dados do backend para objeto cliente simples com contagens
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

  // Filtra clientes baseado em termo de busca e filtro de status
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      // Verifica se corresponde à busca
      const matchesSearch =
        cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.phone.includes(searchTerm);
      // Verifica se corresponde ao status
      const matchesStatus = statusFiltro === "todos" || cliente.status === statusFiltro;
      return matchesSearch && matchesStatus;
    });
  }, [clientes, searchTerm, statusFiltro]);

  // Handler para deletar
  const handleDelete = (id: string) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirma delete
  const confirmDelete = () => {
    // TODO: Implementar chamada à API para delete
    if (clienteToDelete) {
      toast({
        title: "Cliente eliminado",
        description: "O cliente foi eliminado com sucesso.",
      });
    }
    setDeleteDialogOpen(false);
    setClienteToDelete(null);
  };

  // Handler para criar cliente
  const handleCreateCustomer = async (customerData: CustomerRegister) => {
    // Inicia criação
    setCreatingCustomer(true);
    try {
      // Regista cliente
      await customerService.register(customerData);
      // Mostra sucesso
      toast({ title: "Cliente Criado", description: "O novo cliente foi criado com sucesso." });
      // Fecha modal
      setNewCustomerModalOpen(false);
      // Refetch
      refetch();
    } catch (err) {
      // Log erro
      console.error('Create customer error:', err);
      // Mostra erro
      toast({
        title: "Erro",
        description: getErrorMessage(err, "Não foi possível criar o cliente."),
        variant: "destructive",
      });
    } finally {
      // Finaliza criação
      setCreatingCustomer(false);
    }
  };

  // Handler para reset password
  const handleResetPassword = (id: string) => {
    setClienteToResetPassword(id);
    setResetPasswordDialogOpen(true);
  };

  // Confirma reset password
  const confirmResetPassword = async () => {
    if (!clienteToResetPassword) return;
    try {
      // Reseta password
      await customerService.resetPassword(clienteToResetPassword);
      // Mostra sucesso
      toast({ title: "Password Resetada", description: "A password foi alterada para '12345678'." });
    } catch (err) {
      // Log erro
      console.error('Reset error:', err);
      // Mostra erro
      toast({ title: "Erro", description: "Não foi possível resetar a password.", variant: "destructive" });
    } finally {
      // Fecha dialog
      setResetPasswordDialogOpen(false);
      setClienteToResetPassword(null);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-PT');

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / pageSize));
  // Clientes paginados
  const paginatedClientes = filteredClientes.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Retorna dados e handlers
  return {
    // Dados
    paginatedClientes,
    filteredClientes,
    loading,
    error,
    selectedCustomerId,

    // Estado da UI
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

    // Paginação
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