import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Spinner } from "react-bootstrap";
import type { VehicleCreate } from "../interfaces/Vehicle";
import { useFetchCustomers } from "../hooks/useCustomers";
import { useNewVehicleModal } from "../hooks/useNewVehicleModal";

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: VehicleCreate) => Promise<void>;
  loading: boolean;
}

export default function NewVehicleModal({ isOpen, onClose, onSubmit, loading }: NewVehicleModalProps) {
  const { customers } = useFetchCustomers();
  const { formData, handleChange, validateForm } = useNewVehicleModal(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
          <DialogDescription>Preencha os dados do novo veículo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={e => handleChange("brand", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={e => handleChange("model", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plate">Matrícula *</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={e => handleChange("plate", e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer_id">Cliente *</Label>
              <Select
                value={formData.customer_id.toString()}
                onValueChange={value => handleChange("customer_id", parseInt(value))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(profile => (
                    <SelectItem key={profile.customer.id} value={profile.customer.id.toString()}>
                      {profile.customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kilometers">Quilometragem</Label>
              <Input
                id="kilometers"
                type="number"
                value={formData.kilometers}
                onChange={e => handleChange("kilometers", parseInt(e.target.value))}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  A Criar...
                </>
              ) : (
                "Criar Veículo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
