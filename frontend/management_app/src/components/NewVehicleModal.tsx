import React from 'react';
import { Spinner } from 'react-bootstrap';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';
import './../styles/NewVehicleModal.css';
import type { VehicleCreate } from '../interfaces/Vehicle';
import { useFetchCustomers } from '../hooks/useCustomers';
import { useNewVehicleModal } from '../hooks/useNewVehicleModal';
import type { VehicleAPI } from '../interfaces/VehicleAPI';

// Interface para props do modal
interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleCreate) => Promise<void>;
  getFromAPI?: (plate: string) => Promise<VehicleAPI | null>;
  loading: boolean;
}

// Componente modal para novo veículo
const NewVehicleModal: React.FC<NewVehicleModalProps> = ({ 
  isOpen, 
  onClose,
  getFromAPI,
  onSubmit, 
  loading 
}) => {
  // Busca lista de clientes
  const { customers } = useFetchCustomers();
  // Usa hook personalizado para gerenciar estado do formulário
  const { formData, handleChange, validateForm, handleGetFromAPI } = useNewVehicleModal(isOpen);

  // Manipula submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  // Não renderiza se modal não estiver aberto
  if (!isOpen) return null;

  // Renderização do modal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        <div className="card" style={{ border: '1px solid #dc3545', borderRadius: '8px'}}>
          <div className="card-body p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-semibold">Novo Veículo</h5>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                disabled={loading}
                className="modal-close-button"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Row 1: Plate and Customer */}
                <div className="col-md-6">
                  <Label htmlFor='plate' className="d-flex form-label small text-muted mb-1">
                    Matrícula *
                  </Label>
                  <Input
                    type="text"
                    id="plate"
                    name="plate"
                    required
                    value={formData.plate}
                    onChange={e => handleChange('plate', e.target.value.toUpperCase())}
                    disabled={loading}
                    placeholder="Digite a Matrícula"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='customer_id' className="d-flex form-label small text-muted mb-1">
                    Cliente
                  </Label>
                  <Select
                    value={formData.customer_id > 0 ? formData.customer_id.toString() : ''}
                    onValueChange={value => handleChange('customer_id', parseInt(value))}
                    disabled={loading}
                  >
                    <SelectTrigger 
                      className="form-control"
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
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

                {/* Row 2: Brand and Model */}
                <div className="col-md-6">
                  <Label htmlFor='brand' className="d-flex form-label small text-muted mb-1">
                    Marca *
                  </Label>
                  <Input
                    type="text"
                    id="brand"
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={e => handleChange('brand', e.target.value)}
                    disabled={loading}
                    placeholder="Digite a Marca"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='model' className="d-flex form-label small text-muted mb-1">
                    Modelo *
                  </Label>
                  <Input
                    type="text"
                    id="model"
                    name="model"
                    required
                    value={formData.model}
                    onChange={e => handleChange('model', e.target.value)}
                    disabled={loading}
                    placeholder="Digite o Modelo"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>

                {/* Row 3: Kilometers and Color */}
                <div className="col-md-6">
                  <Label htmlFor='kilometers' className="d-flex form-label small text-muted mb-1">
                    Quilometragem
                  </Label>
                  <Input
                    type="number"
                    id="kilometers"
                    name="kilometers"
                    value={formData.kilometers}
                    onChange={e => handleChange('kilometers', parseInt(e.target.value) || 0)}
                    disabled={loading}
                    placeholder="Digite a Quilometragem"
                    min="0"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='color' className="d-flex form-label small text-muted mb-1">
                    Cor
                  </Label>
                  <Input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color || ''}
                    onChange={e => handleChange('color', e.target.value)}
                    disabled={loading}
                    placeholder="Digite a Cor"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>

                {/* Row 4: Engine Size and Fuel Type */}
                <div className="col-md-6">
                  <Label htmlFor='engineSize' className="d-flex form-label small text-muted mb-1">
                    Cilindrada
                  </Label>
                  <Input
                    type="text"
                    id="engineSize"
                    name="engineSize"
                    value={formData.engineSize || ''}
                    onChange={e => handleChange('engineSize', e.target.value)}
                    disabled={loading}
                    placeholder="Ex: 1.6, 2.0"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='fuelType' className="d-flex form-label small text-muted mb-1">
                    Tipo de Combustível
                  </Label>
                    <Input
                    type="text"
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType || ''}
                    onChange={e => handleChange('fuelType', e.target.value)}
                    disabled={loading}
                    placeholder="Digite o Tipo de Combustível (ex: Gasolina, Diesel)"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>

                {/* Row 5: Imported */}
                <div className="col-md-6 d-flex align-items-center">
                  <Label htmlFor='imported' className="d-flex form-label small text-muted mb-1">
                      Importado:
                  </Label>
                    <input
                      type="checkbox"
                      id="imported"
                      name="imported"
                      checked={formData.imported || false}
                      onChange={e => handleChange('imported', Number(e.target.checked))}
                      disabled={loading}
                      className="form-check-input ms-2"
                    />
                </div>

                {/* Row 6: Description */}
                <div className="col-12">
                  <Label htmlFor='description' className="d-flex form-label small text-muted mb-1">
                    Descrição
                  </Label>
                  <Input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    disabled={loading}
                    placeholder="Nome do veículo (ex: Toyota Corolla)"
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>
              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => handleGetFromAPI(getFromAPI)}
                  disabled={loading || !formData.plate}
                  className="btn-custom-filled"
                >GET FROM API</Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="btn-custom-outline"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={loading}
                  className="btn-custom-filled"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      A Criar...
                    </>
                  ) : (
                    'Criar Veículo'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewVehicleModal;
