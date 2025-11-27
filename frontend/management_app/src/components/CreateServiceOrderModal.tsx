// ...existing code...
import React, { useEffect, useState } from "react";
import type { FC } from "react";
import { getCustomers, getCustomerVehicles, getServices, createAppointment } from "../services/ServiceOrders";
import type { CreateServiceOrderModalProps } from "../interfaces/ServiceOrderModal";
import type { Service } from "../interfaces/Service";
import type { Vehicle } from "../interfaces/Vehicle";
import type { Customer } from "../interfaces/Customer";

const CreateServiceOrderModal: FC<CreateServiceOrderModalProps> = ({ show, onClose, onSuccess }) => {
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
    description: "",
    estimated_budget: 0,
  });

  useEffect(() => {
    if (!show) return;
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

  const updateDateTime = (date: string, time: string) => {
    if (!date || !time) {
      setForm((f) => ({ ...f, appointment_date: "" }));
      return;
    }
    setForm((f) => ({ ...f, appointment_date: `${date}T${time}` }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!form.customer_id) return setError("Selecione um cliente.");
    if (!form.service_id) return setError("Selecione um serviço.");
    if (!form.appointment_date) return setError("Escolha data e hora.");
    if (!form.vehicle_id) return setError("Selecione um veículo.");
    if (!form.description || form.description.trim().length < 4) return setError("Descreva o serviço (mín. 4 caracteres).");

    setSubmitting(true);
    try {
      const payload = {
        customer_id: form.customer_id,
        vehicle_id: form.vehicle_id,
        service_id: form.service_id,
        appointment_date: form.appointment_date,
        description: form.description,
        estimated_budget: form.estimated_budget || 0,
      };
  
      onSuccess();
      onClose();
      setForm({
        customer_id: 0,
        vehicle_id: 0,
        service_id: 0,
        appointment_date: "",
        description: "",
        estimated_budget: 0,
      });
    } catch (err: any) {
      setError(String(err?.message ?? "Erro ao criar ordem"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow appointment-modal">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Nova Ordem de Serviço</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Fechar" />
          </div>

          <div className="modal-body">
            {loadingData ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Cliente *</label>
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

                    <div className="col-md-6">
                      <label className="form-label">Veículo *</label>
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
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Serviço *</label>
                      <select
                        className="form-select"
                        value={form.service_id}
                        onChange={(e) => {
                          const sid = Number(e.target.value);
                          const svc = services.find((s) => s.id === sid);
                          setForm((f) => ({ ...f, service_id: sid, estimated_budget: svc?.price ?? f.estimated_budget }));
                        }}
                        required
                      >
                        <option value={0}>Selecione um serviço</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — R$ {s.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Data *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.appointment_date ? form.appointment_date.split("T")[0] : ""}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = form.appointment_date ? form.appointment_date.split("T")[1] ?? "" : "";
                          updateDateTime(date, time);
                        }}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Hora *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={form.appointment_date ? form.appointment_date.split("T")[1] ?? "" : ""}
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = form.appointment_date ? form.appointment_date.split("T")[0] ?? "" : "";
                          updateDateTime(date, time);
                        }}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Orçamento Estimado</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={form.estimated_budget}
                        onChange={(e) => setForm((f) => ({ ...f, estimated_budget: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Descrição *</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer border-top mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={submitting}>
                      {submitting ? "A enviar..." : "Criar Ordem"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceOrderModal;
