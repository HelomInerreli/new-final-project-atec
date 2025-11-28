import React from "react";
import type { FC } from "react";
import type { CreateServiceOrderModalProps } from "../interfaces/ServiceOrderModal";
import { useServiceOrderModal } from "../hooks/useServiceOrderModal";
import "../styles/CreateServiceOrderModal.css";

const CreateServiceOrderModal: FC<CreateServiceOrderModalProps> = ({ show, onClose, onSuccess }) => {
  const {
    currentStep,
    loadingData,
    submitting,
    customers,
    services,
    vehicles,
    error,
    form,
    availableTimes,
    selectedCustomer,
    selectedVehicle,
    selectedService,
    setForm,
    handleDateChange,
    handleServiceChange,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    handleClose,
  } = useServiceOrderModal(show, onSuccess, onClose);

  if (!show) return null;

  return (
    <div className="service-order-modal-overlay" onClick={handleClose}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-clipboard-check"></i>
            Nova Ordem de Serviço
          </h5>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Fechar">
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">
              {currentStep === 1
                ? "Selecione cliente, serviço e horário"
                : currentStep === 2
                ? "Escolha o veículo e descreva"
                : "Confirme os detalhes"}
            </span>
            <span className="progress-percentage">{Math.round((currentStep / 3) * 100)}% completo</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(currentStep / 3) * 100}%` }} />
          </div>
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
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-person-fill"></i>
                        Cliente *
                      </label>
                      <select
                        className="form-select"
                        value={form.customer_id}
                        onChange={(e) => setForm((f) => ({ ...f, customer_id: Number(e.target.value) }))}
                        required
                      >
                        <option value={0}>Selecione um cliente</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.phone ? `— ${c.phone}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-wrench"></i>
                        Serviço *
                      </label>
                      <select
                        className="form-select"
                        value={form.service_id}
                        onChange={(e) => handleServiceChange(Number(e.target.value))}
                        required
                      >
                        <option value={0}>Selecione um serviço</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — €{s.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            <i className="bi bi-calendar3"></i>
                            Data *
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.appointment_date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <small className="form-text">
                            <i className="bi bi-info-circle"></i>
                            Apenas dias de semana (seg-sex)
                          </small>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            <i className="bi bi-clock"></i>
                            Hora *
                          </label>
                          <select
                            className="form-select"
                            value={form.appointment_time}
                            onChange={(e) => setForm((f) => ({ ...f, appointment_time: e.target.value }))}
                            required
                          >
                            <option value="">Selecione a hora</option>
                            {availableTimes.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          <small className="form-text">
                            <i className="bi bi-clock"></i>
                            Horário: 09:00 - 17:00
                          </small>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-car-front"></i>
                        Veículo *
                      </label>
                      <select
                        className="form-select"
                        value={form.vehicle_id}
                        onChange={(e) => setForm((f) => ({ ...f, vehicle_id: Number(e.target.value) }))}
                        required
                      >
                        <option value={0}>Selecione um veículo</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.brand ?? ""} {v.model ?? ""} {v.plate ? `— ${v.plate}` : ""}
                          </option>
                        ))}
                      </select>
                      {vehicles.length === 0 && (
                        <small className="form-text text-warning">
                          <i className="bi bi-exclamation-triangle"></i>
                          Nenhum veículo encontrado para este cliente
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-file-text"></i>
                        Descrição do Serviço *
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Descreva o problema ou serviço necessário..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="bi bi-currency-euro"></i>
                        Orçamento Estimado
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={form.estimated_budget}
                        onChange={(e) => setForm((f) => ({ ...f, estimated_budget: Number(e.target.value) }))}
                      />
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="summary-card">
                    <h5 className="summary-title">
                      <i className="bi bi-check-circle"></i>
                      Resumo da Ordem de Serviço
                    </h5>
                    <div className="summary-row">
                      <span className="summary-label">Cliente:</span>
                      <span className="summary-value">{selectedCustomer?.name || "-"}</span>
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
                      <span className="summary-label">Veículo:</span>
                      <span className="summary-value">
                        {selectedVehicle
                          ? `${selectedVehicle.brand} ${selectedVehicle.model} — ${selectedVehicle.plate}`
                          : "-"}
                      </span>
                    </div>
                    {form.description && (
                      <div className="summary-row">
                        <span className="summary-label">Descrição:</span>
                        <span className="summary-value">{form.description}</span>
                      </div>
                    )}
                    <hr className="summary-divider" />
                    <div className="summary-total">
                      <span className="summary-label">Orçamento Estimado:</span>
                      <span className="summary-value">€{form.estimated_budget.toFixed(2)}</span>
                    </div>
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
                disabled={!form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time}
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
              <button
                type="button"
                className="btn btn-danger"
                onClick={goToNextStep}
                disabled={!form.vehicle_id || !form.description}
              >
                Próximo
                <i className="bi bi-arrow-right"></i>
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
                    Confirmar Ordem
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

export default CreateServiceOrderModal;