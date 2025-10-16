import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomerVehicles, createAppointment, getServices } from '../services/customerService';

interface CreateAppointmentModalProps {
  show: boolean;
  onClose: () => void;
  customerId: number;
  onSuccess: () => void;
}

interface AppointmentForm {
  appointment_date: string;
  description: string;
  estimated_budget: number;
  vehicle_id: number;
  service_id: number;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate: string;
  kilometers: number;
}

export function CreateAppointmentModal({ show, onClose, customerId, onSuccess }: CreateAppointmentModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<AppointmentForm>({
    appointment_date: '',
    description: '',
    estimated_budget: 0,
    vehicle_id: 0,
    service_id: 0,
  });

  // Estados separados para data e hora
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Etapa do formulário: 1 = serviço/preço, 2 = resto
  const [step, setStep] = useState(1);

  // Função para combinar data e hora
  const updateDateTime = (date: string, time: string) => {
    if (date && time) {
      const dateTime = `${date}T${time}`;
      setForm(prev => ({ ...prev, appointment_date: dateTime }));
    } else {
      setForm(prev => ({ ...prev, appointment_date: '' }));
    }
  };

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (show) {
      fetchData();
      setStep(1); // Reset para a primeira etapa ao abrir
      setForm({
        appointment_date: '',
        description: '',
        estimated_budget: 0,
        vehicle_id: 0,
        service_id: 0,
      });
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [show, customerId]);

  const fetchData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const vehiclesData = await getCustomerVehicles(customerId);
      setVehicles(vehiclesData);
      const servicesData = await getServices();
      setServices(servicesData);
    } catch (error: any) {
      setError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleServiceChange = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      estimated_budget: service?.price || 0
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        ...form,
        customer_id: customerId,
      };
      await createAppointment(appointmentData);
      onSuccess();
      setForm({
        appointment_date: '',
        description: '',
        estimated_budget: 0,
        vehicle_id: 0,
        service_id: 0,
      });
      setSelectedDate('');
      setSelectedTime('');
    } catch (error: any) {
      alert(`Erro ao criar agendamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title text-dark fw-bold">
              <i className="bi bi-calendar-plus me-2 text-primary"></i>
              Agendar Novo Serviço
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {loadingData ? (
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3 text-muted">Carregando dados da API...</p>
            </div>
          ) : error ? (
            <div className="modal-body text-center py-5">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button 
                className="btn btn-primary" 
                onClick={fetchData}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Tentar Novamente
              </button>
            </div>
          ) : (
            <form onSubmit={step === 1 ? handleNext : handleSubmit}>
              <div className="modal-body bg-white">
                <div className="row">
                  {step === 1 && (
                    <>
                      {/* Serviço */}
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-gear me-1 text-primary"></i>
                          Serviço *
                        </label>
                        <select
                          className="form-select border-2"
                          value={form.service_id}
                          onChange={(e) => handleServiceChange(parseInt(e.target.value))}
                          required
                        >
                          <option value="">Selecione um serviço</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name} - €{service.price}
                              {service.description && ` (${service.description})`}
                            </option>
                          ))}
                        </select>
                        <div className="form-text text-info">
                          <i className="bi bi-info-circle me-1"></i>
                          Selecione o serviço pretendido.
                        </div>
                      </div>
                      {/* Orçamento Estimado */}
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-currency-euro me-1 text-primary"></i>
                          Orçamento Estimado (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control border-2"
                          value={form.estimated_budget}
                
                          readOnly 
                          placeholder="0.00"
                          // O 'required' não é estritamente necessário em campos readOnly com valor preenchido, mas pode manter
                          required 
                        />
                        <div className="form-text text-muted">
                          <i className="bi bi-lightbulb me-1"></i>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      {/* Data e Hora */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-calendar-event me-1 text-primary"></i>
                          Data *
                        </label>
                        <input
                          type="date"
                          className="form-control border-2 mb-2"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            updateDateTime(e.target.value, selectedTime);
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          style={{
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                          onClick={(e) => {
                            (e.target as HTMLInputElement).showPicker?.();
                          }}
                          required
                        />
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-clock me-1 text-primary"></i>
                          Hora *
                        </label>
                        <input
                          type="time"
                          className="form-control border-2"
                          value={selectedTime}
                          onChange={(e) => {
                            setSelectedTime(e.target.value);
                            updateDateTime(selectedDate, e.target.value);
                          }}
                          style={{
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                          onClick={(e) => {
                            (e.target as HTMLInputElement).showPicker?.();
                          }}
                          required
                        />
                        {form.appointment_date && (
                          <div className="form-text text-success mt-2">
                            <i className="bi bi-check-circle me-1"></i>
                            <strong>Agendado para:</strong> {new Date(form.appointment_date).toLocaleString('pt-PT')}
                          </div>
                        )}
                      </div>

                      {/* Veículo */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-car-front me-1 text-primary"></i>
                          Veículo *
                        </label>
                        <select
                          className="form-select border-2"
                          value={form.vehicle_id}
                          onChange={(e) => setForm(prev => ({ ...prev, vehicle_id: parseInt(e.target.value) }))}
                          required
                        >
                          <option value="">Selecione um veículo</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model} - {vehicle.plate}
                            </option>
                          ))}
                        </select>
                        {vehicles.length === 0 && !loadingData && (
                          <div className="form-text text-warning">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Nenhum veículo encontrado para este cliente
                          </div>
                        )}
                        {vehicles.length > 0 && (
                          <div className="form-text text-success">
                            <i className="bi bi-check-circle me-1"></i>
                          </div>
                        )}
                      </div>

                      {/* Descrição */}
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-text-paragraph me-1 text-primary"></i>
                          Descrição *
                        </label>
                        <textarea
                          className="form-control border-2"
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o problema ou serviço necessário..."
                          required
                        />
                      </div>

                      {/* Info do Cliente */}
                      <div className="col-12">
                        <div className="alert alert-light border border-primary">
                          <i className="bi bi-info-circle me-2 text-primary"></i>
                          <strong className="text-dark">Cliente:</strong> 
                          <span className="text-muted"> ID {customerId}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-light border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Cancelar
                </button>
                {step === 1 ? (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!form.service_id || !form.estimated_budget}
                  >
                    Seguinte
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={
                      loading || loadingData ||
                      vehicles.length === 0 ||
                      !form.appointment_date ||
                      !form.vehicle_id ||
                      !form.description
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Criando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        Agendar Serviço
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

