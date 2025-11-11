import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // ✅ ADICIONAR
import { useAuth } from '../api/auth';
import { type CreateAppointmentModalProps } from '../interfaces/appointment';

// Hooks
import { useAppointmentForm } from '../hooks/useAppointmentForm';
import { useAppointmentProgress } from '../hooks/useAppointmentProgress';
import { useAppointmentInstructions } from '../hooks/useAppointmentInstructions';
import { useServicesData } from '../hooks/useServicesData';

// Services
import { submitAppointment, validateAppointmentForm } from '../services/appointmentService';

// Utils
import { getTodayDateString } from '../utils/appointmentHelpers';

// Styles
import '../styles/appointmentModal.css';

export function CreateAppointmentModal({ 
  show, 
  onClose, 
  onSuccess 
}: CreateAppointmentModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ✅ ADICIONAR
  const auth = useAuth();
  const customerId = auth?.loggedInCustomerId ?? null;
  const isLoggedIn = auth?.isLoggedIn ?? false; // ✅ ADICIONAR

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // ✅ Custom Hooks
  const {
    form,
    setForm,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    updateDateTime,
    resetForm,
  } = useAppointmentForm();

  const {
    loading: loadingData,
    services,
    vehicles,
    error,
    fetchData,
  } = useServicesData(customerId);

  const { progress, carLeft } = useAppointmentProgress(
    form,
    selectedDate,
    selectedTime
  );

  const instruction = useAppointmentInstructions(
    step,
    form,
    services,
    selectedDate,
    selectedTime
  );

  // ✅ FIX: useEffect SEM resetForm e fetchData nas dependências
  useEffect(() => {
    if (show) {
      setStep(1);
      resetForm(); // ✅ OK chamar aqui
      fetchData(); // ✅ OK chamar aqui
    }
    // ✅ IMPORTANTE: NÃO adicionar resetForm nem fetchData aqui
  }, [show]); // ✅ Apenas 'show' como dependência

  // ✅ Handlers
  const handleServiceChange = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      estimated_budget: service?.price || 0,
    }));
  };

  // ✅ NOVA FUNÇÃO: Verificar login antes de avançar
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Se não estiver logado, redireciona para login
    if (!isLoggedIn) {
      onClose(); // Fecha o modal
      navigate('/register', { 
        state: { 
          message: t('loginRequired', 'Por favor, faça login para agendar um serviço'),
          returnTo: '/services'
        } 
      });
      return;
    }

    // ✅ Se estiver logado, avança para step 2
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    setLoading(true);
    try {
      await submitAppointment({
        ...form,
        customer_id: customerId,
      });
      onSuccess();
      resetForm();
    } catch (err: any) {
      alert(
        t('appointmentModal.errorCreating', {
          defaultValue: `Erro ao criar agendamento: ${err.message}`,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow appointment-modal">
          
          {/* Header */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-calendar-plus me-2"></i>
              {t('appointmentModal.title', { defaultValue: 'Agendar Novo Serviço' })}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label={t('close', { defaultValue: 'Fechar' })}
            />
          </div>

          {/* Progress Bar */}
          <div className="progress-center-wrapper">
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <div
                className="car-icon"
                role="img"
                aria-label={t('appointmentModal.progressAria', {
                  percent: progress,
                  defaultValue: `Progresso ${progress} por cento`,
                })}
                style={{ left: carLeft }}
              >
                <i className="bi bi-car-front-fill" />
              </div>
            </div>

            <div className="progress-instruction">
              <strong>{instruction}</strong>
            </div>

            <div className="progress-percent">
              {progress}% {t('appointmentModal.percentComplete', { defaultValue: 'completo' })}
            </div>
          </div>

          {/* Body */}
          {loadingData ? (
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">
                  {t('loading', { defaultValue: 'Carregando...' })}
                </span>
              </div>
              <p className="mt-3 text-muted">
                {t('appointmentModal.loadingApi', { 
                  defaultValue: 'Carregando dados da API...' 
                })}
              </p>
            </div>
          ) : error ? (
            <div className="modal-body text-center py-5">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button className="btn btn-primary" onClick={fetchData}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                {t('appointmentModal.tryAgain', { defaultValue: 'Tentar Novamente' })}
              </button>
            </div>
          ) : (
            <form onSubmit={step === 1 ? handleNext : handleSubmit}>
              <div className="modal-body bg-white">
                <div className="row">
                  
                  {/* Step 1: Service Selection */}
                  {step === 1 && (
                    <>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-gear me-1 text-dark"></i>
                          {t('service', { defaultValue: 'Serviço' })} *
                        </label>
                        <select
                          className="form-select border-2"
                          value={form.service_id}
                          onChange={(e) => handleServiceChange(parseInt(e.target.value))}
                          required
                        >
                          <option value="">
                            {t('appointmentModal.selectServicePlaceholder', { 
                              defaultValue: 'Selecione um serviço' 
                            })}
                          </option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name} - €{service.price}
                              {service.description && ` (${service.description})`}
                            </option>
                          ))}
                        </select>
                        <div className="form-text text-info">
                          <i className="bi bi-info-circle me-1"></i>
                          {t('appointmentModal.selectServiceHelp', { 
                            defaultValue: 'Selecione o serviço pretendido.' 
                          })}
                        </div>
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-currency-euro me-1 text-dark"></i>
                          {t('appointmentModal.estimatedBudget', { 
                            defaultValue: 'Orçamento Estimado (€)' 
                          })}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control border-2"
                          value={form.estimated_budget}
                          readOnly
                          placeholder="0.00"
                          required
                        />
                      </div>

                      {/* ✅ AVISO: Login obrigatório */}
                      {!isLoggedIn && (
                        <div className="col-12">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>
                              {t('appointmentModal.loginRequired', { 
                                defaultValue: 'Login necessário:' 
                              })}
                            </strong>{' '}
                            {t('appointmentModal.loginRequiredMessage', { 
                              defaultValue: 'Você será redirecionado para fazer login antes de continuar.' 
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2: Details */}
                  {step === 2 && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-calendar-event me-1 text-dark"></i>
                          {t('date', { defaultValue: 'Data' })} *
                        </label>
                        <input
                          type="date"
                          className="form-control border-2 mb-2"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            updateDateTime(e.target.value, selectedTime);
                          }}
                          min={getTodayDateString()}
                          style={{ cursor: 'pointer', fontSize: '1rem' }}
                          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                          required
                        />
                        
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-clock me-1 text-dark"></i>
                          {t('time', { defaultValue: 'Hora' })} *
                        </label>
                        <input
                          type="time"
                          className="form-control border-2"
                          value={selectedTime}
                          onChange={(e) => {
                            setSelectedTime(e.target.value);
                            updateDateTime(selectedDate, e.target.value);
                          }}
                          style={{ cursor: 'pointer', fontSize: '1rem' }}
                          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                          required
                        />
                        
                        {form.appointment_date && (
                          <div className="form-text text-success mt-2">
                            <i className="bi bi-check-circle me-1"></i>
                            <strong>
                              {t('appointmentModal.scheduledFor', { 
                                defaultValue: 'Agendado para:' 
                              })}
                            </strong>{' '}
                            {new Date(form.appointment_date).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-car-front me-1 text-dark"></i>
                          {t('vehicle', { defaultValue: 'Veículo' })} *
                        </label>
                        <select
                          className="form-select border-2"
                          value={form.vehicle_id}
                          onChange={(e) => 
                            setForm(prev => ({ 
                              ...prev, 
                              vehicle_id: parseInt(e.target.value) 
                            }))
                          }
                          required
                        >
                          <option value="">
                            {t('appointmentModal.selectVehiclePlaceholder', { 
                              defaultValue: 'Selecione um veículo' 
                            })}
                          </option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model} - {vehicle.plate}
                            </option>
                          ))}
                        </select>
                        
                        {vehicles.length === 0 && !loadingData && (
                          <div className="form-text text-warning">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {t('appointmentModal.noVehiclesFound', { 
                              defaultValue: 'Nenhum veículo encontrado' 
                            })}
                          </div>
                        )}
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-text-paragraph me-1 text-dark"></i>
                          {t('description', { defaultValue: 'Descrição' })} *
                        </label>
                        <textarea
                          className="form-control border-2"
                          rows={3}
                          value={form.description}
                          onChange={(e) => 
                            setForm(prev => ({ 
                              ...prev, 
                              description: e.target.value 
                            }))
                          }
                          placeholder={t('appointmentModal.descriptionPlaceholder', { 
                            defaultValue: 'Descreva o problema...' 
                          })}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <div className="alert alert-light border border-primary">
                          <i className="bi bi-info-circle me-2 text-primary"></i>
                          <strong className="text-dark">
                            {t('appointmentModal.clientLabel', { defaultValue: 'Cliente:' })}
                          </strong>
                          <span className="text-muted"> ID {customerId}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={onClose}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  {t('cancel', { defaultValue: 'Cancelar' })}
                </button>
                
                {step === 1 ? (
                  <button
                    type="submit"
                    className="btn btn-light text-danger"
                    disabled={!form.service_id || !form.estimated_budget}
                  >
                    {/* ✅ TEXTO DINÂMICO: "Fazer Login" ou "Seguinte" */}
                    {!isLoggedIn ? (
                      <>
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        {t('appointmentModal.loginToContinue', { 
                          defaultValue: 'Fazer Login para Continuar' 
                        })}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right me-1"></i>
                        {t('appointmentModal.next', { defaultValue: 'Seguinte' })}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-light text-danger"
                    disabled={
                      loading ||
                      !validateAppointmentForm(form, vehicles, loadingData)
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {t('appointmentModal.creating', { defaultValue: 'Criando...' })}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        {t('appointmentModal.createAppointment', { 
                          defaultValue: 'Agendar Serviço' 
                        })}
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
