import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Edit, Trash2, Save, User } from "lucide-react";
import { useVehicleDetailsPage } from "../../hooks/useVehicleDetails";
import { Spinner, Alert } from "react-bootstrap";
import "../../styles/VehicleDetails.css";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";

// Componente de detalhes do veículo
export default function VehicleDetails() {
  // Hook de autenticação para verificar permissões
  const { canEdit } = useAuth();

  // Obter ID do veículo da URL
  const { id } = useParams<{ id: string }>();

  // Hook para gerenciar detalhes do veículo
  const {
    vehicleData,
    loading,
    error,
    isEditing,
    setIsEditing,
    formData,
    handleSave,
    handleDelete,
    handleInputChange,
  } = useVehicleDetailsPage(id);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5">A Carregar Veículo...</span>
      </div>
    );
  }

  // Estado de erro
  if (error || !vehicleData) {
    return (
      <div className="container my-4">
        <Alert variant="danger">{error || "Veículo não encontrado"}</Alert>
        <Link to="/vehicles">
          <Button variant="outline" className="mt-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Veículos
          </Button>
        </Link>
      </div>
    );
  }

  // Calcular status do veículo
  const status = vehicleData.vehicle.deleted_at
    ? "Inativo"
    : vehicleData.vehicle.customer_id === 0
    ? "Sem Cliente"
    : "Ativo";

  // Renderizar página de detalhes
  return (
    <div
      className="container"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/vehicles">
          <Button variant="ghost" size="icon" className="back-button-custom">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="h3 fw-bold mb-0">Detalhes do Veículo</h1>
      </div>

      {/* Card de informações do veículo */}
      <div
        className="card mb-4"
        style={{ border: "1px solid #dc3545", borderRadius: "8px" }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h5 className="mb-0 fw-semibold">Informações do Veículo</h5>
              <Badge
                variant={status === "Ativo" ? "destructive" : "secondary"}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
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
                  <X
                    className="me-2"
                    style={{ width: "16px", height: "16px" }}
                  />
                  Cancelar
                </Button>
              )}
              <Button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                variant={isEditing ? "destructive" : "outline"}
                className={
                  isEditing ? "btn-custom-filled" : "btn-custom-outline"
                }
              >
                {isEditing ? (
                  <Save
                    className="me-2"
                    style={{ width: "16px", height: "16px" }}
                  />
                ) : (
                  <Edit
                    className="me-2"
                    style={{ width: "16px", height: "16px" }}
                  />
                )}
                {isEditing ? "Salvar" : "Editar"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="btn-custom-filled"
              >
                <Trash2
                  className="me-2"
                  style={{ width: "16px", height: "16px" }}
                />
                Excluir
              </Button>
            </div>
          </div>

          <div className="row g-4">
            {/* Row 1: Brand and Model */}
            <div className="col-md-6">
              <Label
                htmlFor="brand"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Marca
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
            <div className="col-md-6">
              <Label
                htmlFor="model"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Modelo
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>

            {/* Row 2: Plate and Kilometers */}
            <div className="col-md-6">
              <Label
                htmlFor="plate"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Matrícula
              </Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => handleInputChange("plate", e.target.value)}
                disabled
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
            <div className="col-md-6">
              <Label
                htmlFor="kilometers"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Quilometragem
              </Label>
              <Input
                id="kilometers"
                type="number"
                value={formData.kilometers}
                onChange={(e) =>
                  handleInputChange("kilometers", parseInt(e.target.value) || 0)
                }
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>

            {/* Row 3: Color and Fuel Type */}
            <div className="col-md-6">
              <Label
                htmlFor="color"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Cor
              </Label>
              <Input
                id="color"
                value={formData.color || ""}
                onChange={(e) => handleInputChange("color", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
            <div className="col-md-6">
              <Label
                htmlFor="fuelType"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Tipo de Combustível
              </Label>
              <Input
                id="fuelType"
                value={formData.fuelType || ""}
                onChange={(e) => handleInputChange("fuelType", e.target.value)}
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>

            {/* Row 4: Engine Size and Imported */}
            <div className="col-md-6">
              <Label
                htmlFor="engineSize"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Cilindrada
              </Label>
              <Input
                id="engineSize"
                value={formData.engineSize || ""}
                onChange={(e) =>
                  handleInputChange("engineSize", e.target.value)
                }
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="Ex: 1.6L, 2.0L"
              />
            </div>
            <div className="col-md-6">
              <Label
                htmlFor="imported"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Importado
              </Label>
              <Select
                value={formData.imported ? "true" : "false"}
                onValueChange={(value) =>
                  handleInputChange("imported", value === "true")
                }
                disabled={!isEditing}
              >
                <SelectTrigger style={{ backgroundColor: "#f8f9fa" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Não</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 5: Description */}
            <div className="col-12">
              <Label
                htmlFor="description"
                className="form-label small text-muted mb-1 d-block text-start"
              >
                Descrição
              </Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                disabled={!isEditing}
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="Informações adicionais sobre o veículo"
              />
            </div>

            {/* Row 6: Registration Date */}
            <div className="col-12">
              <Label className="form-label small text-muted mb-1 d-block text-start">
                Data de Cadastro
              </Label>
              <Input
                value={new Date(
                  vehicleData.vehicle.created_at
                ).toLocaleDateString("pt-PT")}
                disabled
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card do proprietário */}
      <div
        className="card"
        style={{ border: "1px solid #dc3545", borderRadius: "8px" }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-semibold">Proprietário do Veículo</h5>
          </div>

          {!vehicleData.customer ? (
            <p className="text-center text-muted py-5 mb-0">
              Este veículo não está associado a nenhum cliente
            </p>
          ) : (
            <div className="row g-3 text-start">
              <div className="col-md-6">
                <p className="small text-muted">Nome</p>
                <p className="mb-0 fw-semibold">{vehicleData.customer.name}</p>
              </div>
              <div className="col-md-6">
                <p className="small text-muted">Telefone</p>
                <p className="mb-0 fw-semibold">
                  {vehicleData.customer.phone || "N/A"}
                </p>
              </div>
              <div className="col-md-6">
                <p className="small text-muted">Cidade</p>
                <p className="mb-0 fw-semibold">
                  {vehicleData.customer.city || "N/A"}
                </p>
              </div>
              {canEdit && (
                <div className="col-md-6 align-self-end">
                  <Link to={`/customers/${vehicleData.customer.id}`}>
                    <Button
                      variant="outline"
                      className="btn-custom-outline w-100"
                    >
                      <User
                        className="me-2"
                        style={{ width: "16px", height: "16px" }}
                      />
                      Ver Perfil do Cliente
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
