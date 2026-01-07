import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { X } from 'lucide-react';
import './../styles/NewCustomerModal.css';
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import type { CustomerRegister } from '../interfaces/Customer';
import { useNewCustomerModal } from '../hooks/useNewCustomerModal';

// Interface para props do modal
interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerRegister) => void;
  loading: boolean;
}

// Componente modal para novo cliente
const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  // Usa hook personalizado para gerenciar estado do formulário
  const {
    formData,
    error,
    handleChange,
    handleDateChange,
    validateForm,
  } = useNewCustomerModal(isOpen);

  // Manipula submissão do formulário
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Não renderiza se modal não estiver aberto
  if (!isOpen) return null;

  // Renderização do modal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        <div className="card modal-card">
          <div className="card-body p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-semibold">Novo Cliente</h5>
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
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <div className="row g-4">
                {/* Row 1: Name and Phone */}
                <div className="col-md-6">
                  <Label htmlFor='name' className="d-flex form-label small text-muted mb-1">
                    Nome Completo *
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite o Nome"
                    className="form-control modal-input"
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='phone' className="d-flex form-label small text-muted mb-1">
                    Telefone
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite o Telefone"
                    className="form-control modal-input"
                  />
                </div>

                {/* Row 2: Birth Date and Address */}
                <div className="col-md-6">
                  <Label htmlFor="birth_date" className="d-flex form-label small text-muted mb-1">
                    Data de Nascimento
                  </Label>
                  <DatePicker
                    selected={formData.birth_date ? new Date(formData.birth_date) : null}
                    onChange={handleDateChange}
                    locale={ptBR}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    minDate={new Date("1900-01-01")}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    disabled={loading}
                    className="form-control modal-input"
                    placeholderText="Selecione a data"
                    wrapperClassName="w-100"
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='address' className="d-flex form-label small text-muted mb-1">
                    Endereço
                  </Label>
                  <Input 
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite o Endereço"
                    className="form-control modal-input"
                  />
                </div>

                {/* Row 3: Country, City, Postal Code */}
                <div className="col-md-4">
                  <Label htmlFor='country' className="d-flex form-label small text-muted mb-1">
                    País
                  </Label>
                  <Input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite o País"
                    className="form-control modal-input"
                  />
                </div>
                <div className="col-md-4">
                  <Label htmlFor='city' className="d-flex form-label small text-muted mb-1">
                    Cidade
                  </Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite a Cidade"
                    className="form-control modal-input"
                  />
                </div>
                <div className="col-md-4">
                  <Label htmlFor='postal_code' className="d-flex form-label small text-muted mb-1">
                    Código Postal
                  </Label>
                  <Input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite o Código Postal"
                    className="form-control modal-input"
                  />
                </div>

                {/* Login Section */}
                <div className="d-flex border-top">
                    <h5 className="fw-semibold pt-3">Login</h5>
                </div>
                <div className="col-md-6">
                  <Label htmlFor='email' className="d-flex form-label small text-muted mb-1">
                    Email *
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite o Email"
                    required
                    className="form-control modal-input"
                  />
                </div>
                <div className="col-md-6">
                  <Label htmlFor='password' className="d-flex form-label small text-muted mb-1">
                    Password *
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Digite a Password"
                    required
                    className="form-control modal-input"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4">
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
                      Criando...
                    </>
                  ) : (
                    "Criar Cliente"
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

export default NewCustomerModal;