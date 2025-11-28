import React, { useEffect, useState } from "react";
import type { FC } from "react";
import { getCustomers, getCustomerVehicles, getServices, createAppointment } from "../services/ServiceOrders";
import type { CreateServiceOrderModalProps } from "../interfaces/ServiceOrderModal";
import type { Service } from "../interfaces/Service";
import type { Vehicle } from "../interfaces/Vehicle";
import type { Customer } from "../interfaces/Customer";

const CreateServiceOrderModal: FC<CreateServiceOrderModalProps> = ({ show, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_id: 0,
    vehicle_id: 0,
    service_id: 0,
    appointment_date: "",
    appointment_time: "",
    description: "",
    estimated_budget: 0,
  });


  const availableTimes = [
    "09:00", "09:15", "09:30", "09:45",
    "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45",
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45",
    "17:00"
  ];

  useEffect(() => {
    if (!show) {
      setCurrentStep(1);
      setForm({
        customer_id: 0,
        vehicle_id: 0,
        service_id: 0,
        appointment_date: "",
        appointment_time: "",
        description: "",
        estimated_budget: 0,
      });
      setError(null);
      return;
    }

    setError(null);
    setLoadingData(true);
    Promise.all([getCustomers(), getServices()])
      .then(([custs, svcs]) => {
        setCustomers(Array.isArray(custs) ? custs : []);
        setServices(Array.isArray(svcs) ? svcs : []);
      })
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [show]);

  useEffect(() => {
    if (!form.customer_id) {
      setVehicles([]);
      setForm((f) => ({ ...f, vehicle_id: 0 }));
      return;
    }
    setLoadingData(true);
    getCustomerVehicles(form.customer_id)
      .then((v) => setVehicles(Array.isArray(v) ? v : []))
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoadingData(false));
  }, [form.customer_id]);

 
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value) {
      const selectedDate = new Date(value + 'T00:00:00');
      const dayOfWeek = selectedDate.getDay();
      
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setError("Por favor, selecione um dia de semana (segunda a sexta-feira).");
        return;
      }
    }

    setForm((f) => ({ ...f, appointment_date: value }));
    setError(null);
  };

  const goToNextStep = () => {
    setError(null);

    if (currentStep === 1) {
      if (!form.customer_id) return setError("Selecione um cliente.");
      if (!form.service_id) return setError("Selecione um serviço.");
      if (!form.appointment_date) return setError("Escolha a data.");
      if (!form.appointment_time) return setError("Escolha o horário.");
    }

    if (currentStep === 2) {
      if (!form.vehicle_id) return setError("Selecione um veículo.");
      if (!form.description || form.description.trim().length < 4) {
        return setError("Descreva o serviço (mín. 4 caracteres).");
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const goToPreviousStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time || !form.vehicle_id) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: form.customer_id,
        vehicle_id: form.vehicle_id,
        service_id: form.service_id,
        appointment_date: `${form.appointment_date}T${form.appointment_time}`,
        description: form.description,
        estimated_budget: form.estimated_budget || 0,
      };

      await createAppointment(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao criar ordem"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setError(null);
    onClose();
  };

  if (!show) return null;

  const selectedCustomer = customers.find((c) => c.id === form.customer_id);
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
  const selectedService = services.find((s) => s.id === form.service_id);

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={handleClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow">
          {/* Header */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Nova Ordem de Serviço</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Fechar" />
          </div>

          {/*  Progress Bar (mantida) */}
          <div className="px-3 pt-4 pb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium">
                {currentStep === 1
                  ? "Selecione cliente, serviço e horário"
                  : currentStep === 2
                  ? "Escolha o veículo e descreva"
                  : "Confirme os detalhes"}
              </span>
              <span className="text-muted small">{Math.round((currentStep / 3) * 100)}% completo</span>
            </div>
            <div className="progress" style={{ height: "8px", borderRadius: "50rem" }}>
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: `${(currentStep / 3) * 100}%`, transition: "width 0.3s ease-in-out" }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="modal-body">
            {loadingData ? (
              <div className="text-center py-4">
                <div className="spinner-border text-danger" role="status" />
                <p className="mt-2 text-muted">A carregar dados...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* STEP 1: Cliente, Serviço, Data e Hora */}
                  {currentStep === 1 && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-person-fill me-1"></i>
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

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-wrench me-1"></i>
                          Serviço *
                        </label>
                        <select
                          className="form-select"
                          value={form.service_id}
                          onChange={(e) => {
                            const sid = Number(e.target.value);
                            const svc = services.find((s) => s.id === sid);
                            setForm((f) => ({ ...f, service_id: sid, estimated_budget: svc?.price ?? 0 }));
                          }}
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
                        {/*  Calendário com validação de fins de semana */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-calendar3 me-1"></i>
                            Data *
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.appointment_date}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <small className="form-text text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Apenas dias de semana (seg-sex)
                          </small>
                        </div>

                        {/*  Seletor de horários (igual ao appointments.tsx) */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-clock me-1"></i>
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
                          <small className="form-text text-muted">
                            <i className="bi bi-clock me-1"></i>
                            Horário: 09:00 - 17:00
                          </small>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 2: Veículo e Descrição */}
                  {currentStep === 2 && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-car-front me-1"></i>
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
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Nenhum veículo encontrado para este cliente
                          </small>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Descrição do Serviço *</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Descreva o problema ou serviço necessário..."
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Orçamento Estimado (€)</label>
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

                  {/* STEP 3: Confirmação */}
                  {currentStep === 3 && (
                    <div className="bg-light rounded p-4 border">
                      <h5 className="fw-bold text-danger mb-3">Resumo da Ordem de Serviço</h5>
                      <div className="d-flex flex-column gap-2 small">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Cliente:</span>
                          <span className="fw-medium">{selectedCustomer?.name || "-"}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Serviço:</span>
                          <span className="fw-medium">{selectedService?.name || "-"}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Data:</span>
                          <span className="fw-medium">
                            {form.appointment_date
                              ? new Date(form.appointment_date + "T00:00:00").toLocaleDateString("pt-PT")
                              : "-"}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Hora:</span>
                          <span className="fw-medium">{form.appointment_time || "-"}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Veículo:</span>
                          <span className="fw-medium">
                            {selectedVehicle
                              ? `${selectedVehicle.brand} ${selectedVehicle.model} — ${selectedVehicle.plate}`
                              : "-"}
                          </span>
                        </div>
                        {form.description && (
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Descrição:</span>
                            <span className="fw-medium text-end" style={{ maxWidth: "60%" }}>
                              {form.description}
                            </span>
                          </div>
                        )}
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold">Orçamento Estimado:</span>
                          <span className="fw-bold text-success">€{form.estimated_budget.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top">
            {currentStep === 1 && (
              <>
                <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={goToNextStep}
                  disabled={
                    !form.customer_id || !form.service_id || !form.appointment_date || !form.appointment_time
                  }
                >
                  Próximo
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <button type="button" className="btn btn-outline-secondary" onClick={goToPreviousStep}>
                  Voltar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={goToNextStep}
                  disabled={!form.vehicle_id || !form.description}
                >
                  Próximo
                </button>
              </>
            )}

            {currentStep === 3 && (
              <>
                <button type="button" className="btn btn-outline-secondary" onClick={goToPreviousStep}>
                  Voltar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      A criar...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Confirmar Ordem
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceOrderModal;