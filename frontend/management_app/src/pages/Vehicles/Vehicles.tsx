import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import Badge from "react-bootstrap/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useState } from "react";
import NewVehicleModal from "../../components/NewVehicleModal";
import { useVehiclesPage } from "../../hooks/useVehicles";
import { useFetchCustomers } from "../../hooks/useCustomers";
import "../../styles/Vehicles.css";

export default function Vehicles() {
  const {
    paginatedVehicles,
    filteredVehicles,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFiltro,
    setStatusFiltro,
    newVehicleModalOpen,
    setNewVehicleModalOpen,
    creatingVehicle,
    deleteDialogOpen,
    setDeleteDialogOpen,
    assignCustomerDialogOpen,
    setAssignCustomerDialogOpen,
    page,
    setPage,
    totalPages,
    pageSize,
    handleDelete,
    confirmDelete,
    handleAssignCustomer,
    confirmAssignCustomer,
    handleCreateVehicle,
    formatKilometers,
    getFromAPI,
  } = useVehiclesPage();

  const { customers } = useFetchCustomers();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5">A Carregar Veículos...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
    <div className="vehicles-container d-flex flex-column">
      <div className="vehicles-header d-flex align-items-center justify-content-between mb-4 border-bottom border-light">
        <div>
          <h1 className="h1 fw-bold text-dark">Gestão de Veículos</h1>
          <p className="text-muted">Gerencie os veículos da oficina</p>
        </div>
        <Button variant="destructive" onClick={() => setNewVehicleModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      <div className="d-flex gap-3 mb-3">
        <div className="position-relative flex-grow-1">
          <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
          <Input
            placeholder="Pesquisar veículos por marca, modelo, matrícula ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="ps-5"
          />
        </div>
        <div className="vehicles-status-select">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Sem Cliente">Sem Cliente</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
          </Select>
        </div>
      </div>

      <div className="vehicles-table-wrapper table-responsive border rounded flex-grow-1">
        <Table>
          <TableHeader className="vehicles-table-header">
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Quilometragem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum veículo encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    <Badge bg="danger">{vehicle.plate}</Badge>
                  </TableCell>
                  {vehicle.customerId === 0 ? (
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleAssignCustomer(vehicle.id)}
                        title="Associar Cliente"
                      >
                        Associar Cliente
                      </Button>
                    </TableCell>
                  ) : ( 
                  <TableCell>
                    <Link to={`/customers/${vehicle.customerId}`} className="text-decoration-none">
                      {vehicle.customerName}
                    </Link>
                  </TableCell>
                  )}
                  <TableCell>{formatKilometers(vehicle.kilometers)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/vehicles/${vehicle.id}`}>
                        <Button variant="outline" size="icon" title="Ver Detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(vehicle.id)}
                        title="Eliminar"
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

      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-2 mb-4" style={{ flexShrink: 0 }}>
        <div className="text-muted">
          {filteredVehicles.length === 0
            ? ""
            : (() => {
              const start = (page - 1) * pageSize + 1;
              const end = Math.min(page * pageSize, filteredVehicles.length);
              return `Mostrando ${start}–${end} de ${filteredVehicles.length}`;
            })()}
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <div className="align-self-center">
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O veículo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Vehicle Modal */}
      <NewVehicleModal
        isOpen={newVehicleModalOpen}
        onClose={() => setNewVehicleModalOpen(false)}
        onSubmit={handleCreateVehicle}
        getFromAPI={getFromAPI}
        loading={creatingVehicle}
      />

      {/* Assign Customer Dialog */}
      <Dialog open={assignCustomerDialogOpen} onOpenChange={setAssignCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associar Cliente ao Veículo</DialogTitle>
            <DialogDescription>
              Selecione um cliente para associar a este veículo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.customer.id} value={customer.customer.id.toString()}>
                    {customer.customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignCustomerDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedCustomerId) {
                  confirmAssignCustomer(parseInt(selectedCustomerId));
                  setSelectedCustomerId("");
                }
              }}
              disabled={!selectedCustomerId}
            >
              Associar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
