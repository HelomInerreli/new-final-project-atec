import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import Badge from "react-bootstrap/Badge";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useFetchVehicles } from "../../hooks/useVehicles";
import NewVehicleModal from "../../components/NewVehicleModal";
import type { VehicleCreate } from "../../interfaces/Vehicle";
import { vehicleService } from "../../services/vehicleService";

export default function Vehicles() {
  // Fetch vehicles with refetch capability
  const { vehicles: rawVehicles, loading, error, refetch } = useFetchVehicles();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);

  // Map backend data 
  const vehicles = useMemo(() => {
    return rawVehicles.map(vehicle => ({
      id: vehicle.id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      kilometers: vehicle.kilometers || 0,
      customerName: vehicle.customer_name || "Unknown",
      customerId: vehicle.customer_id,
    }));
  }, [rawVehicles]);

  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [vehicles, searchTerm]);

  const handleDelete = (id: string) => {
    setVehicleToDelete(parseInt(id));
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await vehicleService.delete(vehicleToDelete);
        toast({
          title: "Veículo eliminado",
          description: "O veículo foi eliminado com sucesso.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar o veículo.",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleCreateVehicle = async (vehicleData: VehicleCreate) => {
    setCreatingVehicle(true);
    try {
      await vehicleService.create(vehicleData);
      toast({ title: "Veículo Criado", description: "O novo veículo foi criado com sucesso." });
      setNewVehicleModalOpen(false);
      // Refresh the list
      refetch();
    } catch (error: any) {
      console.error("Create vehicle error:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Não foi possível criar o veículo.",
        variant: "destructive",
      });
    } finally {
      setCreatingVehicle(false);
    }
  };

  const formatKilometers = (km: number) => {
    return km > 0 ? `${km.toLocaleString("pt-PT")} km` : "0 km";
  };

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
          <h1 className="h1 fw-bold text-dark">Gestão de Veículos</h1>
          <p className="text-muted mt-1">Gerencie os veículos da oficina</p>
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
              filteredVehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    <Badge bg="danger">{vehicle.plate}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/customers/${vehicle.customerId}`} className="text-decoration-none">
                      {vehicle.customerName}
                    </Link>
                  </TableCell>
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
        loading={creatingVehicle}
      />
    </div>
  );
}
