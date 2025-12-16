import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import "../../styles/Customers.css";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "../../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Search, Trash2, Eye, Key } from "lucide-react";
import Badge from "react-bootstrap/Badge";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useCustomersPage } from "../../hooks/useCustomers";
import NewCustomerModal from "../../components/NewCustomerModal";

export default function Customers() {
  const {
    filteredClientes,
    loading,
    error,
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
    handleDelete,
    confirmDelete,
    handleCreateCustomer,
    handleResetPassword,
    confirmResetPassword,
    formatDate,
  } = useCustomersPage();

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
      <div className="d-flex flex-column customers-container">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-light customers-header-wrapper">
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
        <div className="customers-status-filter">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="table-responsive border rounded flex-grow-1 customers-table-wrapper">
        <Table>
          <TableHeader className="customers-table-header">
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
