import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "./../../components/ui/button";
import { Input } from "./../../components/ui/input";
import { Label } from "./../../components/ui/label";
import { Badge } from "./../../components/ui/badge";
import { ArrowLeft, Edit, Trash2, Car, Save} from "lucide-react";
import { useToast } from "./../../hooks/use-toast";
import { useFetchCustomerById } from "./../../hooks/useCustomerDetails";
import { Spinner, Alert} from "react-bootstrap";
import "./../../styles/CustomerDetails.css";
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format, parseISO } from "date-fns"
import { cn } from "../../components/lib/utils"


type Veiculo = {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  deleted_at: string | null;
};

type ClienteForm = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  country: string;
  city: string;
  postalCode: string;
};


export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ClienteForm>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    country: "",
    city: "",
    postalCode: "",
  });

  // Fetch customer data from backend
  const { customerData, loading, error, updateCustomer } = useFetchCustomerById(id);

  // Update form data when customer data is loaded
  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.customer.name || "",
        email: customerData.auth.email || "",
        phone: customerData.customer.phone || "",
        birthDate: customerData.customer.birth_date || "",
        address: customerData.customer.address || "",
        country: customerData.customer.country || "",
        city: customerData.customer.city || "",
        postalCode: customerData.customer.postal_code || "",
      });
    }
  }, [customerData]);

  const handleSave = async () => {
    try {
      await updateCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birth_date: formData.birthDate,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
      });
      setIsEditing(false);
      toast({
        title: "Alterações salvas",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar os dados do cliente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    // TODO: Implement API call to delete customer
    toast({
      title: "Cliente excluído",
      description: "O cliente foi removido do sistema.",
      variant: "destructive",
    });
    navigate("/customers");
  };

  const handleInputChange = (field: keyof ClienteForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5">A Carregar Cliente...</span>
      </div>
    );
  }

  // Error state
  if (error || !customerData) {
    return (
      <div className="container my-4">
        <Alert variant="danger">
          {error || "Cliente não encontrado"}
        </Alert>
        <Link to="/customers">
          <Button variant="outline" className="mt-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </Link>
      </div>
    );
  }

  const status = customerData.auth.is_active ? "Ativo" : "Inativo";
  const vehicles: Veiculo[] = customerData.vehicles.filter(v => !v.deleted_at);

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/customers">
          <Button 
            variant="ghost" 
            size="icon" 
            className="back-button-custom"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="h3 fw-bold mb-0">Detalhes do Cliente</h1>
      </div>

      {/* Customer Information Card */}
      <div className="card mb-4" style={{ border: '1px solid #dc3545', borderRadius: '8px' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h5 className="mb-0 fw-semibold">Informações do Cliente</h5>
              <Badge 
                variant={status === "Ativo" ? "destructive" : "secondary"}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              >
                {status}
              </Badge>
            </div>
            <div className="d-flex gap-2">
              {isEditing && (
                 <Button 
                 onClick={() => setIsEditing(false)}
                 variant="outline"
                 className="btn-custom-outline"
               >
                 <X className="me-2" style={{ width: '16px', height: '16px' }} />
                 Cancelar
               </Button>
              )}
              <Button 
                onClick={isEditing ? handleSave : () => setIsEditing(true)} 
                variant={isEditing ? "destructive" : "outline"}
                className={isEditing ? "btn-custom-filled" : "btn-custom-outline"}
              >
                {isEditing ? (
                  <Save className="me-2" style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Edit className="me-2" style={{ width: '16px', height: '16px' }} />
                )}
                {isEditing ? "Salvar" : "Editar"}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="btn-custom-filled"
              >
                <Trash2 className="me-2" style={{ width: '16px', height: '16px' }} />
                Excluir
              </Button>
            </div>
          </div>

          <div className="row g-4">
            {/* Row 1: Name and Email */}
            <div className="col-md-6">
              <Label htmlFor="name" className="form-label small text-muted mb-1 d-block text-start">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="col-md-6">
              <Label htmlFor="email" className="form-label small text-muted mb-1 d-block text-start">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>

            {/* Row 2: Phone and Birth Date */}
            <div className="col-md-6">
              <Label htmlFor="phone" className="form-label small text-muted mb-1 d-block text-start">
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
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
                      !formData.birthDate && "text-muted-foreground"
                    )}
                    style={{ backgroundColor: '#f8f9fa', height: '38px', borderColor: '#dee2e6', color: '#495057' }}
                    disabled={!isEditing}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthDate ? format(parseISO(formData.birthDate), "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[1100]" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.birthDate ? parseISO(formData.birthDate) : undefined}
                    onSelect={(date) => {
                      setFormData({
                        ...formData,
                        birthDate: date ? format(date, "yyyy-MM-dd") : ''
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
            </div>

                
            {/* Row 3: Address */}
            <div className="col-12">
              <Label htmlFor="address" className="form-label small text-muted mb-1 d-block text-start">
                Endereço
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>

            {/* Row 4: Country, City, Postal Code */}
            <div className="col-md-4">
              <Label htmlFor="country" className="form-label small text-muted mb-1 d-block text-start">
                País
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="col-md-4">
              <Label htmlFor="city" className="form-label small text-muted mb-1 d-block text-start">
                Cidade
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="col-md-4">
              <Label htmlFor="postalCode" className="form-label small text-muted mb-1 d-block text-start">
                Código Postal
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>

            {/* Row 5: Registration Date */}
            <div className="col-12">
              <Label className="form-label small text-muted mb-1 d-block text-start">
                Data de Cadastro
              </Label>
              <Input
                value={new Date(customerData.customer.created_at).toLocaleDateString("pt-PT")}
                disabled
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Card */}
      <div className="card" style={{ border: '1px solid #dc3545', borderRadius: '8px' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-semibold">Veículos do Cliente</h5>
            <Button 
              variant="destructive"
              className="btn-custom-filled"
            >
              <Car className="me-2" style={{ width: '16px', height: '16px' }} />
              Adicionar Veículo
            </Button>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">
              Nenhum veículo cadastrado para este cliente
            </p>
          ) : (
            <div>
              {vehicles.map((veiculo, index) => (
                <div key={veiculo.id}>
                  {index > 0 && <hr className="my-4" style={{ borderColor: '#dee2e6' }} />}
                  
                  <div className="row g-3">
                    <div className="col-md-4">
                      <p className="small text-muted mb-1 text-start">Marca/Modelo</p>
                      <p className="mb-0 fw-semibold">
                        {veiculo.brand} {veiculo.model}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="small text-muted mb-1 text-start">Matrícula</p>
                      <p className="mb-0 fw-semibold">{veiculo.plate}</p>
                    </div>
                    <div className="col-md-4">
                      <p className="small text-muted mb-1 text-start">Ano</p>
                      <p className="mb-0 fw-semibold">
                        {new Date().getFullYear() - Math.floor(veiculo.kilometers / 15000)}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="small text-muted mb-1 text-start">Cor</p>
                      <p className="mb-0">N/A</p>
                    </div>
                    <div className="col-md-8">
                      <p className="small text-muted mb-1 text-start">
                        <Calendar className="me-1" style={{ width: '14px', height: '14px' }} />
                        Última Revisão
                      </p>
                      <p className="mb-0">
                        {new Date(customerData.customer.updated_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
