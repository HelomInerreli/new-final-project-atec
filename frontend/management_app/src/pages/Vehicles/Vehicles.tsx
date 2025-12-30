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
import CreateVehicleModal from "../../components/CreateVehicleModal";
import { useVehiclesPage } from "../../hooks/useVehicles";
import { useFetchCustomers } from "../../hooks/useCustomers";
import { toast } from "../../hooks/use-toast";
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
    <div className="flex-1 space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">Gestão de Veículos</h1>
        </div>
        <Button variant="destructive" onClick={() => setNewVehicleModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="mb-input-wrapper flex-1">
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
              style={{ paddingLeft: "46px", borderColor: "#f87171" }}
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
              Pesquisar por marca, modelo, matrícula ou cliente...
            </label>
          </div>
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-full sm:w-[200px] border-2 border-red-600 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" style={{ height: "56px" }}>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Sem Cliente">Sem Cliente</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              <TableHead className="text-left font-semibold text-base text-black">Marca</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Modelo</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Matrícula</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Cliente</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Quilometragem</TableHead>
              <TableHead className="text-center font-semibold text-base text-black">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum veículo encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell className="text-left font-medium">{vehicle.brand}</TableCell>
                  <TableCell className="text-left">{vehicle.model}</TableCell>
                  <TableCell className="text-left">
                    <Badge bg="danger">{vehicle.plate}</Badge>
                  </TableCell>
                  {vehicle.customerId === 0 ? (
                    <TableCell className="text-left">
                      <Button
                        variant="destructive"
                        onClick={() => handleAssignCustomer(vehicle.id)}
                        title="Associar Cliente"
                      >
                        Associar Cliente
                      </Button>
                    </TableCell>
                  ) : ( 
                  <TableCell className="text-left">
                    <Link to={`/customers/${vehicle.customerId}`} className="text-decoration-none">
                      {vehicle.customerName}
                    </Link>
                  </TableCell>
                  )}
                  <TableCell className="text-left">{formatKilometers(vehicle.kilometers)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
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
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          {filteredVehicles.length === 0
            ? ""
            : (() => {
              const start = (page - 1) * pageSize + 1;
              const end = Math.min(page * pageSize, filteredVehicles.length);
              return `Mostrando ${start}–${end} de ${filteredVehicles.length}`;
            })()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <div className="flex items-center px-4 text-sm font-medium">
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
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Eliminar Veículo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Esta ação não pode ser desfeita. Tem a certeza que
              deseja eliminar permanentemente este veículo?
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

      {/* Create Vehicle Modal */}
      <CreateVehicleModal
        show={newVehicleModalOpen}
        onClose={() => setNewVehicleModalOpen(false)}
        onSuccess={() => {
          setNewVehicleModalOpen(false);
          toast({
            title: "Sucesso!",
            description: "Veículo criado com sucesso.",
          });
          getFromAPI();
        }}
      />
    </div>
  );
}

