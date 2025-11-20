import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./../../components/ui/card";
import { Button } from "./../../components/ui/button";
import { Input } from "./../../components/ui/input";
import { Label } from "./../../components/ui/label";
import { Badge } from "./../../components/ui/badge";
import { Separator } from "./../../components/ui/separator";
import { ArrowLeft, Edit, Trash2, Car, Calendar } from "lucide-react";
import { useToast } from "./../../hooks/use-toast";
import { useFetchCustomerById } from "./../../hooks/useCustomerDetails";
import { Spinner, Alert } from "react-bootstrap";

type Veiculo = {
  id: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
};

type ClienteForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
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
    address: "",
    city: "",
    postalCode: "",
  });

  // Fetch customer data from backend
  const { customerData, loading, error } = useFetchCustomerById(id);

  // Update form data when customer data is loaded
  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.customer.name || "",
        email: customerData.auth.email || "",
        phone: customerData.customer.phone || "",
        address: customerData.customer.address || "",
        city: customerData.customer.city || "",
        postalCode: customerData.customer.postal_code || "",
      });
    }
  }, [customerData]);

  const handleSave = () => {
    // TODO: Implement API call to update customer
    setIsEditing(false);
    toast({
      title: "Alterações salvas",
      description: "Os dados do cliente foram atualizados com sucesso.",
    });
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
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="h3 fw-bold mb-0">Detalhes do Cliente</h1>
      </div>

      {/* Customer Information Card */}
      <div className="card mb-4" style={{ border: '2px solid #dc3545', borderRadius: '8px' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h5 className="mb-0 fw-semibold">Informações do Cliente</h5>
              <Badge 
                bg={status === "Ativo" ? "danger" : "secondary"}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              >
                {status}
              </Badge>
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant="outline"
                style={{ 
                  borderColor: '#dc3545', 
                  color: '#dc3545',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem'
                }}
              >
                <Edit className="me-2" style={{ width: '16px', height: '16px' }} />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Trash2 className="me-2" style={{ width: '16px', height: '16px' }} />
                Excluir
              </Button>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <Label htmlFor="nome" className="form-label small text-muted mb-1">
                Nome Completo
              </Label>
              <Input
                id="nome"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="col-md-6">
              <Label htmlFor="email" className="form-label small text-muted mb-1">
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
            <div className="col-md-6">
              <Label htmlFor="telefone" className="form-label small text-muted mb-1">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="col-md-6">
              <Label htmlFor="postalCode" className="form-label small text-muted mb-1">
                NIF
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
            <div className="col-12">
              <Label htmlFor="endereco" className="form-label small text-muted mb-1">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="col-md-6">
              <Label className="form-label small text-muted mb-1">
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
      <div className="card" style={{ border: '2px solid #dc3545', borderRadius: '8px' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-semibold">Veículos do Cliente</h5>
            <Button 
              variant="destructive"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
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
                      <p className="small text-muted mb-1">Marca/Modelo</p>
                      <p className="mb-0 fw-semibold">
                        {veiculo.brand} {veiculo.model}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="small text-muted mb-1">Matrícula</p>
                      <p className="mb-0 fw-semibold">{veiculo.plate}</p>
                    </div>
                    <div className="col-md-4">
                      <p className="small text-muted mb-1">Ano</p>
                      <p className="mb-0 fw-semibold">
                        {new Date().getFullYear() - Math.floor(veiculo.kilometers / 15000)}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="small text-muted mb-1">Cor</p>
                      <p className="mb-0">N/A</p>
                    </div>
                    <div className="col-md-8">
                      <p className="small text-muted mb-1">
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
