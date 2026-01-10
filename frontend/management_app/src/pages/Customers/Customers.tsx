/**
 * Página de gestão de clientes.
 * Permite listar, filtrar, criar, editar e excluir clientes.
 */

import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
import CreateCustomerModal from "../../components/CreateCustomerModal";
import "../../components/inputs.css";
// Estilos de inputs

// Componente funcional para página de clientes
export default function Customers() {
  // Hook para buscar clientes
  const { customers: rawCustomers, loading, error } = useFetchCustomers();

  // Estados para filtros e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Estados para modais
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [clienteToResetPassword, setClienteToResetPassword] = useState<
    string | null
  >(null);
  const [appointmentsDialogOpen, setAppointmentsDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  // IDs dos clientes para contar veículos
  const customerIds = useMemo(() => {
    return rawCustomers.map((profile) => profile.customer.id);
  }, [rawCustomers]);

  // Buscar contagem de veículos
  const { vehicleCounts } = useFetchVehicleCounts(customerIds);

  // Buscar agendamentos do cliente selecionado
  const { appointments: customerAppointments, loading: appointmentsLoading } =
    useFetchCustomerAppointments(selectedCustomerId);

  // Handler para abrir modal de agendamentos
  const handleViewAppointments = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setAppointmentsDialogOpen(true);
  };

  // Mapear dados para tipo Cliente
  const clientes = useMemo(() => {
    return rawCustomers.map((profile) => ({
      id: profile.customer.id.toString(),
      name: profile.customer.name,
      email: profile.auth.email,
      phone: profile.customer.phone || "N/A",
      address: profile.customer.address || "N/A",
      city: profile.customer.city || "N/A",
      postalCode: profile.customer.postal_code || "N/A",
      status: profile.auth.is_active
        ? ("Ativo" as const)
        : ("Inativo" as const),
      lastVisit: profile.customer.updated_at
        ? new Date(profile.customer.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      vehicles: vehicleCounts[profile.customer.id.toString()] || 0,
    }));
  }, [rawCustomers, vehicleCounts]);

  // Filtrar clientes
  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch =
        cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.phone.includes(searchTerm);
      const matchesStatus =
        statusFiltro === "todos" || cliente.status === statusFiltro;
      return matchesSearch && matchesStatus;
    });
  }, [clientes, searchTerm, statusFiltro]);

  // Paginação
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClientes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClientes, currentPage, itemsPerPage]);

  // Handler para deletar
  const handleDelete = (id: string) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirmar delete
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

  // Handler para criar cliente
  const handleCreateCustomer = async (customerData: any) => {
    setCreatingCustomer(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/customersauth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        }
      );

      if (response.ok) {
        toast({
          title: "Cliente Criado",
          description: "O novo cliente foi criado com sucesso.",
        });
        setNewCustomerModalOpen(false);
        // TODO: Refresh customer list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao criar cliente");
      }
    } catch (error) {
      console.error("Create customer error:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível criar o cliente.",
        variant: "destructive",
      });
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Handler para resetar password
  const handleResetPassword = (id: string) => {
    setClienteToResetPassword(id);
    setResetPasswordDialogOpen(true);
  };

  // Confirmar reset de password
  const confirmResetPassword = async () => {
    if (!clienteToResetPassword) return;

    console.log("Resetting password for ID:", clienteToResetPassword);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/customersauth/reset-password/${clienteToResetPassword}`,
        {
          method: "POST",
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        toast({
          title: "Password Resetada",
          description: "A password do cliente foi resetada com sucesso.",
          variant: "destructive",
        });
      } else {
        const errorText = await response.text();
        console.error("Reset failed:", errorText);
        throw new Error("Falha ao resetar password");
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar a password.",
        variant: "destructive",
      });
    } finally {
      setResetPasswordDialogOpen(false);
      setClienteToResetPassword(null);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  // Estado de carregamento e erro - renderizados condicionalmente abaixo

  // Renderizar página
  return (
    <div className="container my-2">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h1 fw-bold text-dark">Gestão de Clientes</h1>
        </div>
        <Button
          variant="destructive"
          onClick={() => setNewCustomerModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="d-flex flex-column flex-sm-row gap-3 mb-3">
        <div className="mb-input-wrapper flex-grow-1">
          <div style={{ position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <input
              type="text"
              placeholder=""
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-input"
              style={{ paddingLeft: "46px", borderColor: "#dc2626" }}
              onFocus={(e) =>
                e.target.nextElementSibling?.classList.add("shrunken")
              }
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.nextElementSibling?.classList.remove("shrunken");
                }
              }}
            />
            <label
              className={`mb-input-label ${searchTerm ? "shrunken" : ""}`}
              style={{ left: "46px" }}
            >
              Pesquisar clientes por nome, email ou telefone...
            </label>
          </div>
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger
            className="border-2 border-red-600 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ width: 200, height: "56px" }}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "2px solid #dc2626",
          }}
        >
          <div
            className="spinner-border text-danger"
            role="status"
            style={{ width: "3rem", height: "3rem", marginBottom: "1rem" }}
          >
            <span className="visually-hidden">A carregar...</span>
          </div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            A carregar clientes...
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Por favor, aguarde enquanto buscamos os dados
          </p>
        </div>
      )}

      {/* Error State */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabela */}
      {!loading && !error && (
        <div
          className="rounded-md border-2 border-red-600"
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
                <TableHead className="font-semibold text-base text-black">
                  Nome
                </TableHead>
                <TableHead className="font-semibold text-base text-black">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-base text-black">
                  Telefone
                </TableHead>
                <TableHead className="font-semibold text-base text-black">
                  Cidade
                </TableHead>
                <TableHead className="text-center font-semibold text-base text-black">
                  Veículos
                </TableHead>
                <TableHead className="font-semibold text-base text-black">
                  Última Visita
                </TableHead>
                <TableHead className="font-semibold text-base text-black">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-base text-black">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {cliente.name}
                    </TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.phone}</TableCell>
                    <TableCell>{cliente.city}</TableCell>
                    <TableCell className="text-center">
                      <Badge bg={cliente.vehicles > 0 ? "danger" : "secondary"}>
                        {cliente.vehicles}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(cliente.lastVisit)}</TableCell>
                    <TableCell>
                      <Badge
                        bg={cliente.status === "Ativo" ? "danger" : "secondary"}
                      >
                        {cliente.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Resetar Password"
                          onClick={() => handleResetPassword(cliente.id)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Ver Agendamentos"
                          onClick={() => handleViewAppointments(cliente.id)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Link to={`/customers/${cliente.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(cliente.id)}
                        >
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
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Eliminar Cliente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Esta ação não pode ser desfeita. Tem a certeza que deseja eliminar
              permanentemente este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
            <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="mt-0 flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Key className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Resetar Password
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              A password deste cliente será alterada para '12345678'. O cliente
              deverá alterar a password no próximo login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
            <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResetPassword}
              className="mt-0 flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Resetar Password
            </AlertDialogAction>
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
      <CreateCustomerModal
        show={newCustomerModalOpen}
        onClose={() => setNewCustomerModalOpen(false)}
        onSuccess={() => {
          setNewCustomerModalOpen(false);
          toast({
            title: "Sucesso!",
            description: "Cliente criado com sucesso.",
          });
          // Refresh the page or refetch customers
          window.location.reload();
        }}
      />
    </div>
  );
}
