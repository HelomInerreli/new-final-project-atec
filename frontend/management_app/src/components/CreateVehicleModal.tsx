import { type FC, useState, useEffect, useRef } from "react";
import { useCreateVehicleModal } from "../hooks/useCreateVehicleModal";
import "../styles/CreateServiceOrderModal.css";
import "../components/inputs.css";

interface CreateVehicleModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateVehicleModal: FC<CreateVehicleModalProps> = ({ show, onClose, onSuccess }) => {
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [fuelTypeDropdownOpen, setFuelTypeDropdownOpen] = useState(false);
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const fuelTypeDropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    loadingData,
    submitting,
    customers,
    error,
    form,
    selectedCustomer,
    setForm,
    handleSubmit,
    handleClose,
  } = useCreateVehicleModal(show, onSuccess, onClose);

  const fuelTypes = ["Gasolina", "Gasóleo", "Elétrico", "Híbrido", "GPL"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerDropdownOpen(false);
      }
      if (fuelTypeDropdownRef.current && !fuelTypeDropdownRef.current.contains(event.target as Node)) {
        setFuelTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show) return null;

  return (
    <div className="service-order-modal-overlay" onClick={handleClose}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-car-front"></i>
            Novo Veículo
          </h5>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="service-order-modal-body">
          {loadingData ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p className="loading-text">A carregar dados...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid gap-4 py-4 px-6">
                  {/* Cliente e Matrícula */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <div ref={customerDropdownRef} style={{ position: "relative" }}>
                          <button
                            type="button"
                            className={`mb-input select ${!form.customer_id ? "placeholder" : ""}`}
                            onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                            style={{ textAlign: "left", cursor: "pointer", minHeight: "56px" }}
                          >
                            {selectedCustomer ? selectedCustomer.name : ""}
                          </button>
                          <label className={`mb-input-label ${form.customer_id ? "shrunken" : ""}`}>
                            Cliente *
                          </label>
                          <span className="mb-select-caret">▼</span>

                          {customerDropdownOpen && (
                            <ul className="mb-select-menu" style={{ maxHeight: "250px", overflowY: "auto" }}>
                              {customers.map((customer) => (
                                <li
                                  key={customer.id}
                                  className={`mb-select-item ${form.customer_id === customer.id ? "selected" : ""}`}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, customer_id: customer.id }));
                                    setCustomerDropdownOpen(false);
                                  }}
                                >
                                  {customer.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="plate"
                          type="text"
                          placeholder=""
                          className={`mb-input ${form.plate ? "filled" : ""}`}
                          value={form.plate}
                          onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                          required
                        />
                        <label className={`mb-input-label ${form.plate ? "shrunken" : ""}`}>
                          Matrícula *
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Marca e Modelo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="brand"
                          type="text"
                          placeholder=""
                          className={`mb-input ${form.brand ? "filled" : ""}`}
                          value={form.brand}
                          onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                          required
                        />
                        <label className={`mb-input-label ${form.brand ? "shrunken" : ""}`}>
                          Marca *
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="model"
                          type="text"
                          placeholder=""
                          className={`mb-input ${form.model ? "filled" : ""}`}
                          value={form.model}
                          onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                          required
                        />
                        <label className={`mb-input-label ${form.model ? "shrunken" : ""}`}>
                          Modelo *
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Quilómetros e Cor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="kilometers"
                          type="number"
                          min="0"
                          placeholder=""
                          className={`mb-input ${form.kilometers ? "filled" : ""}`}
                          value={form.kilometers || ""}
                          onChange={(e) => setForm((f) => ({ ...f, kilometers: e.target.value ? Number(e.target.value) : 0 }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                        />
                        <label className={`mb-input-label ${form.kilometers ? "shrunken" : ""}`}>
                          Quilómetros
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="color"
                          type="text"
                          placeholder=""
                          className={`mb-input ${form.color ? "filled" : ""}`}
                          value={form.color}
                          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                        />
                        <label className={`mb-input-label ${form.color ? "shrunken" : ""}`}>
                          Cor
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cilindrada e Tipo de Combustível */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="engineSize"
                          type="text"
                          placeholder=""
                          className={`mb-input ${form.engineSize ? "filled" : ""}`}
                          value={form.engineSize}
                          onChange={(e) => setForm((f) => ({ ...f, engineSize: e.target.value }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                        />
                        <label className={`mb-input-label ${form.engineSize ? "shrunken" : ""}`}>
                          Cilindrada
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <div ref={fuelTypeDropdownRef} style={{ position: "relative" }}>
                          <button
                            type="button"
                            className={`mb-input select ${!form.fuelType ? "placeholder" : ""}`}
                            onClick={() => setFuelTypeDropdownOpen(!fuelTypeDropdownOpen)}
                            style={{ textAlign: "left", cursor: "pointer", minHeight: "56px" }}
                          >
                            {form.fuelType || ""}
                          </button>
                          <label className={`mb-input-label ${form.fuelType ? "shrunken" : ""}`}>
                            Tipo de Combustível
                          </label>
                          <span className="mb-select-caret">▼</span>

                          {fuelTypeDropdownOpen && (
                            <ul className="mb-select-menu">
                              {fuelTypes.map((fuel) => (
                                <li
                                  key={fuel}
                                  className={`mb-select-item ${form.fuelType === fuel ? "selected" : ""}`}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, fuelType: fuel }));
                                    setFuelTypeDropdownOpen(false);
                                  }}
                                >
                                  {fuel}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Veículo Importado */}
                  <div className="grid gap-2">
                    <div className="mb-checkbox" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        id="imported"
                        type="checkbox"
                        checked={form.imported}
                        onChange={(e) => setForm((f) => ({ ...f, imported: e.target.checked }))}
                      />
                      <label htmlFor="imported" style={{ margin: 0, cursor: "pointer", color: "#111827" }}>
                        Veículo Importado
                      </label>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="grid gap-2">
                    <div className="mb-input-wrapper">
                      <textarea
                        id="description"
                        className={`mb-input textarea ${form.description ? "filled" : ""}`}
                        rows={3}
                        placeholder=""
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                        onBlur={(e) => {
                          if (!e.target.value) {
                            e.target.nextElementSibling?.classList.remove("shrunken");
                          }
                        }}
                      />
                      <label className={`mb-input-label ${form.description ? "shrunken" : ""}`}>
                        Descrição / Observações
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="service-order-modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
            <i className="bi bi-x-circle"></i>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={!form.customer_id || !form.plate || !form.brand || !form.model || submitting}
          >
            {submitting ? (
              <>
                <div className="spinner-border spinner-border-sm"></div>
                A criar...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i>
                Criar Veículo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVehicleModal;
