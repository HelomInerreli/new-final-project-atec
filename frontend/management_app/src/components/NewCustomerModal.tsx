import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import './../styles/CustomerDetails.css';
import { Calendar } from "../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { format, parseISO } from "date-fns"
import { cn } from "../components/lib/utils"
import type { CustomerRegister } from '../interfaces/Customer';
import { useNewCustomerModal } from '../hooks/useNewCustomerModal';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerRegister) => void;
  loading: boolean;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const {
    formData,
    error,
    handleChange,
    handleDateChange,
    validateForm,
  } = useNewCustomerModal(isOpen);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card" style={{ border: '1px solid #dc3545', borderRadius: '8px'}}>
          <div className="card-body p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-semibold">Novo Cliente</h5>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                disabled={loading}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: '#333',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#333';
                }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>

                {/* Row 2: Birth Date and Address */}
                <div className="col-md-6">
                  <Label className="d-flex form-label small text-muted mb-1">
                    Data de Nascimento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.birth_date && "text-muted-foreground"
                        )}
                        style={{ backgroundColor: '#f8f9fa', height: '38px', borderColor: '#dee2e6', color: '#495057' }}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birth_date ? format(parseISO(formData.birth_date), "dd/MM/yyyy") : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[1100]" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birth_date ? parseISO(formData.birth_date) : undefined}
                        onSelect={handleDateChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
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