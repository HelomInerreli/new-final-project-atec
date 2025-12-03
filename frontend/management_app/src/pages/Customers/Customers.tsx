import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "../../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Search, Trash2, Eye, Calendar, Key } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import Badge from "react-bootstrap/Badge";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useFetchCustomers } from "../../hooks/useCustomers";
import { useFetchVehicleCounts } from "../../hooks/useVehicles";
import { useFetchCustomerAppointments } from "../../hooks/useAppointments";
import { CustomerAppointmentsModal } from "../../components/CustomerAppointmentsModal";
import NewCustomerModal from "../../components/NewCustomerModal";

export default function Customers() {
  // Fetch customers with refetch capability
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
  const [appointmentsDialogOpen, setAppointmentsDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Extract customer IDs for vehicle count fetching
  const customerIds = useMemo(() => rawCustomers.map(profile => profile.customer.id), [rawCustomers]);

  // Fetch vehicle counts for all customers
  const { vehicleCounts } = useFetchVehicleCounts(customerIds);

  // Fetch appointments for selected customer
  const { appointments: customerAppointments, loading: appointmentsLoading } = useFetchCustomerAppointments(selectedCustomerId);

  // Handler to open appointments modal
  const handleViewAppointments = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setAppointmentsDialogOpen(true);
  };

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

  const handleCreateCustomer = async (customerData: any) => {
    setCreatingCustomer(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/customersauth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (response.ok) {
        toast({ title: "Cliente Criado", description: "O novo cliente foi criado com sucesso." });
        setNewCustomerModalOpen(false);
        // Refresh the list
        refetch();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar cliente');
      }
    } catch (error) {
      console.error('Create customer error:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o cliente.",
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
      const response = await fetch(`http://localhost:8000/api/v1/customersauth/reset-password/${clienteToResetPassword}`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({ title: "Password Resetada", description: "A password foi alterada para '12345678'." });
      } else {
        const errorText = await response.text();
        console.error('Reset failed:', errorText);
        throw new Error('Falha ao resetar password');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({ title: "Erro", description: "Não foi possível resetar a password.", variant: "destructive" });
    } finally {
      setResetPasswordDialogOpen(false);
      setClienteToResetPassword(null);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-PT');

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5">A Carregar Clientes...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
      <div
        className="d-flex flex-column"
        style={{
          height: "100%",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
        }}
      >
      <div
        className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-light"
        style={{ flexShrink: 0 }}
      >
        <div>
          <h1 className="h1 fw-bold text-dark">Gestão de Clientes</h1>
          <p className="text-muted mt-1">Gerencie os clientes da oficina</p>
        </div>
        <Button variant="destructive" onClick={() => setNewCustomerModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="d-flex gap-3 mb-3">
        <div className="position-relative flex-grow-1">
          <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
          <Input
            placeholder="Pesquisar clientes por nome, email ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="ps-5"
          />
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger style={{ width: 200 }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className="table-responsive border rounded flex-grow-1"
        style={{
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRadius: "0.375rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          minHeight: 0,
        }}
      >
        <Table>
          <TableHeader
          style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "#fff",
            }}
            >
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-center">Veículos</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredClientes.map(cliente => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.name}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.phone}</TableCell>
                  <TableCell>{cliente.city}</TableCell>
                  <TableCell className="text-center">
                    <Badge bg={cliente.vehicles > 0 ? "danger" : "secondary"}>{cliente.vehicles}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(cliente.lastVisit)}</TableCell>
                  <TableCell>
                    <Badge bg={cliente.status === "Ativo" ? "danger" : "secondary"}>{cliente.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" title="Resetar Password" onClick={() => handleResetPassword(cliente.id)}>
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="Ver Agendamentos" onClick={() => handleViewAppointments(cliente.id)}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Link to={`/customers/${cliente.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(cliente.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cliente será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar Password?</AlertDialogTitle>
            <AlertDialogDescription>
              A password deste cliente será alterada para '12345678'. O cliente deverá alterar a password no próximo login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>Resetar Password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Appointments Modal */}
      <CustomerAppointmentsModal
        open={appointmentsDialogOpen}
        onOpenChange={setAppointmentsDialogOpen}
        appointments={customerAppointments}
        loading={appointmentsLoading}
      />

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={newCustomerModalOpen}
        onClose={() => setNewCustomerModalOpen(false)}
        onSubmit={handleCreateCustomer}
        loading={creatingCustomer}
      />
    </div>
  ); 
}
