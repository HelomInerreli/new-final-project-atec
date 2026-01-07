/**
 * Página de detalhes do cliente.
 * Permite visualizar, editar e excluir informações do cliente e seus veículos.
 */

import { useParams, Link } from "react-router-dom";
// Importa hooks de roteamento
import { Button } from "./../../components/ui/button";
// Botão UI
import { Input } from "./../../components/ui/input";
// Input UI
import { Label } from "./../../components/ui/label";
// Label UI
import { Badge } from "./../../components/ui/badge";
// Badge UI
import { ArrowLeft, Edit, Trash2, Save, X, Calendar as CalendarIcon } from "lucide-react";
// Ícones
import { useCustomerDetailsPage } from "./../../hooks/useCustomerDetails";
// Hook personalizado
import { Spinner, Alert} from "react-bootstrap";
// Componentes Bootstrap
import "./../../styles/CustomerDetails.css";
// Estilos CSS
import DatePicker from "react-datepicker";
// DatePicker
import type { Vehicle } from "../../interfaces/Vehicle";
// Tipo Vehicle

// Componente funcional para página de detalhes do cliente
export default function CustomerDetails() {
  // Obtém ID do cliente da URL
  const { id } = useParams<{ id: string }>();

  // Usa hook personalizado
  const {
    customerData,
    loading,
    error,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    handleSave,
    handleDelete,
    handleInputChange,
  } = useCustomerDetailsPage(id);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5">A Carregar Cliente...</span>
      </div>
    );
  }

  // Estado de erro
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

  // Status do cliente
  const status = customerData.auth.is_active ? "Ativo" : "Inativo";
  // Veículos ativos
  const vehicles = customerData.vehicles.filter((v: Vehicle) => !v.deleted_at);

  // Renderiza página
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
              <Label htmlFor="birth_date" className="form-label small text-muted mb-1 d-block text-start">
                Data de Nascimento
              </Label>
              <DatePicker 
                selected={formData.birth_date ? new Date(formData.birth_date) : null}
                onChange={(date) => {
                  setFormData({
                    ...formData,
                    birth_date: date ? date.toISOString().split('T')[0] : ''
                  })
                }}
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                minDate={new Date("1900-01-01")}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                disabled={!isEditing}
                className="form-control"
                placeholderText="Selecione a data"
                wrapperClassName="w-100"
              />
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
                value={formData.postal_code}
                onChange={(e) => handleInputChange("postal_code", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>

            {/* Row 5: Registration Date */}
            <div className="col-12">
              <Label className="form-label small text-muted mb-1 d-block text-start">
                Data de Registro
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
          </div>

          {vehicles.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">
              Nenhum veículo cadastrado para este cliente
            </p>
          ) : (
            <div>
              {vehicles.map((veiculo, index) => (
                <div key={veiculo.id}>
                  {index > 0 && <hr className="my-2" style={{ borderColor: '#dc3545' }} />}

                  <div className="row g-3 text-start">
                    <div className="col-md-4">
                      <p className="small text-muted">Marca/Modelo</p>
                      <p className="mb-0 fw-semibold">{veiculo.brand} {veiculo.model}</p>
                    </div>
                    <div className="col-md-2">
                      <p className="small text-muted">Matrícula</p>
                      <p className="mb-0 fw-semibold">{veiculo.plate}</p>
                    </div>
                    <div className="col-md-2">
                      <p className="small text-muted">Ano</p>
                      <p className="mb-0 fw-semibold">{new Date().getFullYear() - Math.floor(veiculo.kilometers / 15000)}</p>
                    </div>
                    <div className="col-md-2">
                      <p className="small text-muted flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Última Revisão</p>
                      <p className="mb-0 fw-semibold">{new Date(customerData.customer.updated_at).toLocaleDateString("pt-PT")}</p>
                    </div>
                    <div className="col-md-2 align-self-center">
                      <Link to={`/vehicles/${veiculo.id}`}>
                        <Button 
                          variant="outline" 
                          className="btn-custom-outline"
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
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