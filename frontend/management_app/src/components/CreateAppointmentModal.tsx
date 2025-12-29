import { type FC, useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { useAppointmentModal } from "../hooks/useAppointmentModal";
import "../styles/CreateServiceOrderModal.css";
import "../components/inputs.css";

interface CreateAppointmentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAppointmentModal: FC<CreateAppointmentModalProps> = ({ show, onClose, onSuccess }) => {
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    currentStep,
    loadingData,
    submitting,
    customers,
    services,
    vehicles,
    statuses,
    error,
    form,
    availableTimes,
    selectedCustomer,
    selectedVehicle,
    selectedService,
    selectedStatus,
    setForm,
    handleDateChange,
    handleServiceChange,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    handleClose,
  } = useAppointmentModal(show, onSuccess, onClose);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerDropdownOpen(false);
      }
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target as Node)) {
        setVehicleDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setTimeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
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
            <i className="bi bi-calendar-check"></i>
            Novo Agendamento
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
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="grid gap-4 py-4 px-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <div className="mb-input-wrapper">
                          <div ref={customerDropdownRef} style={{ position: "relative" }}>
                            <button
                              type="button"
                              className={`mb-input select ${!form.customer_id ? "placeholder" : ""}`}
                              onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                              style={{ textAlign: "left", cursor: "pointer" }}
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
                          <div ref={vehicleDropdownRef} style={{ position: "relative" }}>
                            <button
                              type="button"
                              className={`mb-input select ${!form.vehicle_id ? "placeholder" : ""}`}
                              onClick={() => form.customer_id && setVehicleDropdownOpen(!vehicleDropdownOpen)}
                              disabled={!form.customer_id}
                              style={{ textAlign: "left", cursor: !form.customer_id ? "not-allowed" : "pointer" }}
                            >
                              {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.plate}` : ""}
                            </button>
                            <label className={`mb-input-label ${form.vehicle_id ? "shrunken" : ""}`}>
                              Veículo *
                            </label>
                            <span className="mb-select-caret">▼</span>

                            {vehicleDropdownOpen && form.customer_id && (
                              <ul className="mb-select-menu" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                {vehicles.length === 0 ? (
                                  <li className="mb-select-item" style={{ cursor: "default", opacity: 0.6 }}>
                                    Nenhum veículo encontrado
                                  </li>
                                ) : (
                                  vehicles.map((vehicle) => (
                                    <li
                                      key={vehicle.id}
                                      className={`mb-select-item ${form.vehicle_id === vehicle.id ? "selected" : ""}`}
                                      onClick={() => {
                                        setForm((f) => ({ ...f, vehicle_id: vehicle.id }));
                                        setVehicleDropdownOpen(false);
                                      }}
                                    >
                                      {vehicle.brand} {vehicle.model} - {vehicle.plate}
                                    </li>
                                  ))
                                )}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <div ref={serviceDropdownRef} style={{ position: "relative" }}>
                          <button
                            type="button"
                            className={`mb-input select ${!form.service_id ? "placeholder" : ""}`}
                            onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                            style={{ textAlign: "left", cursor: "pointer" }}
                          >
                            {selectedService ? `${selectedService.name} - €${selectedService.price.toFixed(2)}` : ""}
                          </button>
                          <label className={`mb-input-label ${form.service_id ? "shrunken" : ""}`}>
                            Serviço *
                          </label>
                          <span className="mb-select-caret">▼</span>

                          {serviceDropdownOpen && (
                            <ul className="mb-select-menu" style={{ maxHeight: "250px", overflowY: "auto" }}>
                              {services.map((service) => (
                                <li
                                  key={service.id}
                                  className={`mb-select-item ${form.service_id === service.id ? "selected" : ""}`}
                                  onClick={() => {
                                    handleServiceChange(service.id);
                                    setServiceDropdownOpen(false);
                                  }}
                                >
                                  {service.name} - €{service.price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <div className="mb-input-wrapper" style={{ position: "relative" }}>
                          <input
                            id="appointment_date"
                            type="date"
                            className={`mb-input date-input ${form.appointment_date ? "has-value" : ""}`}
                            value={form.appointment_date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                          <label className={`mb-input-label ${form.appointment_date ? "shrunken" : ""}`}>
                            Data *
                          </label>
                          <Calendar
                            size={20}
                            style={{
                              position: "absolute",
                              right: "14px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#6b7280",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const element = document.getElementById("appointment_date") as HTMLInputElement;
                              element?.showPicker?.();
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="mb-input-wrapper">
                          <div ref={timeDropdownRef} style={{ position: "relative" }}>
                            <button
                              type="button"
                              className={`mb-input select ${!form.appointment_time ? "placeholder" : ""}`}
                              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                              style={{ textAlign: "left", cursor: "pointer", minHeight: "56px" }}
                            >
                              {form.appointment_time || ""}
                            </button>
                            <label className={`mb-input-label ${form.appointment_time ? "shrunken" : ""}`}>
                              Hora *
                            </label>
                            <span className="mb-select-caret">▼</span>

                            {timeDropdownOpen && (
                              <ul className="mb-select-menu" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                {availableTimes.map((time) => (
                                  <li
                                    key={time}
                                    className={`mb-select-item ${form.appointment_time === time ? "selected" : ""}`}
                                    onClick={() => {
                                      setForm((f) => ({ ...f, appointment_time: time }));
                                      setTimeDropdownOpen(false);
                                    }}
                                  >
                                    {time}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <div className="mb-input-wrapper">
                          <input
                            id="estimated_budget"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder=""
                            className="mb-input"
                            value={form.estimated_budget || ""}
                            onChange={(e) => setForm((f) => ({ ...f, estimated_budget: e.target.value ? Number(e.target.value) : 0 }))}
                            onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                e.target.nextElementSibling?.classList.remove("shrunken");
                              }
                            }}
                          />
                          <label className={`mb-input-label ${form.estimated_budget ? "shrunken" : ""}`}>
                            Orçamento Estimado (€)
                          </label>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="mb-input-wrapper">
                          <div ref={statusDropdownRef} style={{ position: "relative" }}>
                            <button
                              type="button"
                              className={`mb-input select ${!form.status_id ? "placeholder" : ""}`}
                              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                              style={{ textAlign: "left", cursor: "pointer", minHeight: "56px" }}
                            >
                              {selectedStatus ? selectedStatus.name : ""}
                            </button>
                            <label className={`mb-input-label ${form.status_id ? "shrunken" : ""}`}>
                              Status
                            </label>
                            <span className="mb-select-caret">▼</span>

                            {statusDropdownOpen && (
                              <ul className="mb-select-menu" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                {statuses.map((status) => (
                                  <li
                                    key={status.id}
                                    className={`mb-select-item ${form.status_id === status.id ? "selected" : ""}`}
                                    onClick={() => {
                                      setForm((f) => ({ ...f, status_id: status.id }));
                                      setStatusDropdownOpen(false);
                                    }}
                                  >
                                    {status.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <textarea
                          id="description"
                          className="mb-input textarea"
                          rows={4}
                          placeholder=""
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                        <label className={`mb-input-label ${form.description ? "shrunken" : ""}`}>
                          Descrição
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="summary-card" style={{ margin: "20px" }}>
                    <h5 className="summary-title">
                      <i className="bi bi-check-circle"></i>
                      Resumo do Agendamento
                    </h5>
                    <div className="summary-row">
                      <span className="summary-label">Cliente:</span>
                      <span className="summary-value">{selectedCustomer?.name || "-"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Veículo:</span>
                      <span className="summary-value">
                        {selectedVehicle
                          ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.plate}`
                          : "-"}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Serviço:</span>
                      <span className="summary-value">{selectedService?.name || "-"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Data:</span>
                      <span className="summary-value">
                        {form.appointment_date
                          ? new Date(form.appointment_date + "T00:00:00").toLocaleDateString("pt-PT")
                          : "-"}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Hora:</span>
                      <span className="summary-value">{form.appointment_time || "-"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Orçamento Estimado:</span>
                      <span className="summary-value">€{form.estimated_budget.toFixed(2)}</span>
                    </div>
                    {form.description && (
                      <div className="summary-row">
                        <span className="summary-label">Descrição:</span>
                        <span className="summary-value">{form.description}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="summary-card" style={{ margin: "20px" }}>
                    <h5 className="summary-title">
                      <i className="bi bi-check-circle"></i>
                      Resumo do Agendamento
                    </h5>
                    <div className="summary-row">
                      <span className="summary-label">Cliente:</span>
                      <span className="summary-value">{selectedCustomer?.name || "-"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Veículo:</span>
                      <span className="summary-value">
                        {selectedVehicle
                          ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.plate}`
                          : "-"}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Serviço:</span>
                      <span className="summary-value">{selectedService?.name || "-"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Data:</span>
                      <span className="summary-value">
                        {form.appointment_date
                          ? new Date(form.appointment_date + "T00:00:00").toLocaleDateString("pt-PT")
                          : "-"}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Hora:</span>
                      <span className="summary-value">{form.appointment_time || "-"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Orçamento Estimado:</span>
                      <span className="summary-value">€{form.estimated_budget.toFixed(2)}</span>
                    </div>
                    {form.description && (
                      <div className="summary-row">
                        <span className="summary-label">Descrição:</span>
                        <span className="summary-value">{form.description}</span>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="service-order-modal-footer">
          {currentStep === 1 && (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
                <i className="bi bi-x-circle"></i>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={goToNextStep}
                disabled={!form.customer_id || !form.vehicle_id || !form.service_id || !form.appointment_date || !form.appointment_time}
              >
                Próximo
                <i className="bi bi-arrow-right"></i>
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={goToPreviousStep}>
                <i className="bi bi-arrow-left"></i>
                Voltar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm"></div>
                    A criar...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Confirmar Agendamento
                  </>
                )}
              </button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={goToPreviousStep}>
                <i className="bi bi-arrow-left"></i>
                Voltar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm"></div>
                    A criar...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Confirmar Agendamento
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
