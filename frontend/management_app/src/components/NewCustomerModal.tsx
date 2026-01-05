import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import './../styles/CustomerDetails.css';
import './inputs.css';
import { Calendar } from "../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { format, parseISO } from "date-fns"
import { cn } from "../components/lib/utils"

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  loading: boolean;
}

interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
  email?: string;
  password?: string;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    birth_date: '',
    email: '',
    password: ''
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] p-0 gap-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-t-lg m-0 !flex-row items-center justify-between !space-y-0">
            <DialogTitle className="text-xl font-semibold m-0 text-white">
              Novo Cliente
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
              style={{
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "none",
                outline: "none",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </DialogHeader>
          <div className="p-6">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            <div className="row g-4">
              {/* Row 1: Name and Phone */}
              <div className="col-md-6">
                <div className="mb-input-wrapper">
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    className="mb-input"
                  />
                  <label htmlFor="name" className="mb-input-label">
                    Nome Completo *
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-input-wrapper">
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    className="mb-input"
                  />
                  <label htmlFor="phone" className="mb-input-label">
                    Telefone
                  </label>
                </div>
              </div>

                {/* Row 2: Birth Date and Address */}
                <div className="col-md-6">
                  <div className="mb-input-wrapper">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "mb-input w-full justify-start text-left font-normal h-[48px]",
                            !formData.birth_date && "text-muted-foreground"
                          )}
                          disabled={loading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birth_date ? format(parseISO(formData.birth_date), "dd/MM/yyyy") : " "}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1100]" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.birth_date ? parseISO(formData.birth_date) : undefined}
                          onSelect={(date) => {
                            setFormData({
                              ...formData,
                              birth_date: date ? format(date, "yyyy-MM-dd") : ''
                            })
                          }}
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
                    <label className={`mb-input-label ${formData.birth_date ? "shrunken" : ""}`}>
                      Data de Nascimento
                    </label>
                  </div>
                </div>
              <div className="col-md-6">
                <div className="mb-input-wrapper">
                  <Input 
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    className="mb-input"
                  />
                  <label htmlFor="address" className="mb-input-label">
                    Endereço
                  </label>
                </div>
              </div>

              {/* Row 3: Country, City, Postal Code */}
              <div className="col-md-4">
                <div className="mb-input-wrapper">
                  <Input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    className="mb-input"
                  />
                  <label htmlFor="country" className="mb-input-label">
                    País
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-input-wrapper">
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    className="mb-input"
                  />
                  <label htmlFor="city" className="mb-input-label">
                    Cidade
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-input-wrapper">
                  <Input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    className="mb-input"
                  />
                  <label htmlFor="postal_code" className="mb-input-label">
                    Código Postal
                  </label>
                </div>
              </div>

              {/* Login Section */}
              <div className="d-flex border-top">
                  <h5 className="fw-semibold pt-3">Login</h5>
              </div>
              <div className="col-md-6">
                <div className="mb-input-wrapper">
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    required
                    className="mb-input"
                  />
                  <label htmlFor="email" className="mb-input-label">
                    Email *
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-input-wrapper">
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder=" "
                    required
                    className="mb-input"
                  />
                  <label htmlFor="password" className="mb-input-label">
                    Password *
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 !flex-row !justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={loading}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


export default NewCustomerModal;