// import React, { useState, useEffect, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
// import { getCustomerVehicles, createAppointment, getServices } from '../services/customerService';
// import '../styles/appointmentModal.css';
// import { useAuth } from '../api/auth';

// interface CreateAppointmentModalProps {
//   show: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// interface AppointmentForm {
//   appointment_date: string;
//   description: string;
//   estimated_budget: number;
//   vehicle_id: number;
//   service_id: number;
// }

// interface Service {
//   id: number;
//   name: string;
//   description?: string;
//   price: number;
// }

// interface Vehicle {
//   id: number;
//   brand: string;
//   model: string;
//   plate: string;
//   kilometers: number;
// }

// export function CreateAppointmentModal({ show, onClose, onSuccess }: CreateAppointmentModalProps) {
//   const { t } = useTranslation();
//   const auth = useAuth();
//   const customerId: number | null = auth?.loggedInCustomerId ?? null;

//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(false);
//   const [services, setServices] = useState<Service[]>([]);
//   const [vehicles, setVehicles] = useState<Vehicle[]>([]);
//   const [error, setError] = useState<string>('');
//   const [form, setForm] = useState<AppointmentForm>({
//     appointment_date: '',
//     description: '',
//     estimated_budget: 0,
//     vehicle_id: 0,
//     service_id: 0,
//   });

//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedTime, setSelectedTime] = useState('');
//   const [step, setStep] = useState(1);

//   const updateDateTime = (date: string, time: string) => {
//     if (date && time) {
//       const dateTime = `${date}T${time}`;
//       setForm(prev => ({ ...prev, appointment_date: dateTime }));
//     } else {
//       setForm(prev => ({ ...prev, appointment_date: '' }));
//     }
//   };

//   // progresso (percent)
//   const progress = useMemo(() => {
//     const checks = [
//       !!form.service_id,
//       !!form.estimated_budget && form.estimated_budget > 0,
//       !!selectedDate,
//       !!selectedTime,
//       !!form.vehicle_id,
//       !!form.description && form.description.trim().length > 3,
//     ];
//     const completed = checks.filter(Boolean).length;
//     return Math.round((completed / checks.length) * 100);
//   }, [form.service_id, form.estimated_budget, selectedDate, selectedTime, form.vehicle_id, form.description]);

//   // carLeft dentro do track (constrange para não sair dos limites)
//   const carLeft = useMemo(() => {
//     const start = 1; 
//     const end = 99; 
//     const pct = Math.max(0, Math.min(100, progress));
  
//     return `${start + ((end - start) * pct) / 100}%`;
//   }, [progress]);

//   // instrução dinâmica (um passo de cada vez)
//   const instruction = useMemo(() => {
//     if (step === 1) {
//       if (!form.service_id) return 'Selecione o serviço';
//       const svc = services.find(s => s.id === form.service_id);
//       return svc ? `Serviço: ${svc.name} — clique Seguinte` : 'Serviço selecionado — clique Seguinte';
//     }

//     // step 2: mostrar apenas a próxima ação necessária
//     if (!selectedDate || !selectedTime) return 'Escolha data e hora';
//     if (!form.vehicle_id) return 'Selecione um veículo';
//     if (!form.description || form.description.trim().length <= 3) return 'Descreva o problema (mín. 4 caracteres)';
//     return 'Tudo preenchido — pode enviar o agendamento';
//   }, [step, form.service_id, services, selectedDate, selectedTime, form.vehicle_id, form.description]);

//   useEffect(() => {
//     if (show) {
//       setStep(1);
//       setForm({
//         appointment_date: '',
//         description: '',
//         estimated_budget: 0,
//         vehicle_id: 0,
//         service_id: 0,
//       });
//       setSelectedDate('');
//       setSelectedTime('');
//       fetchData();
//     }
//   }, [show, customerId]);

//   const fetchData = async () => {
//     setLoadingData(true);
//     setError('');
//     try {
//       const servicesData = await getServices();
//       setServices(servicesData);

//       if (customerId) {
//         const vehiclesData = await getCustomerVehicles(customerId);
//         setVehicles(vehiclesData);
//       } else {
//         setVehicles([]);
//       }
//     } catch (error: any) {
//       setError(`Erro ao carregar dados: ${error.message}`);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   const handleServiceChange = (serviceId: number) => {
//     const service = services.find(s => s.id === serviceId);
//     setForm(prev => ({
//       ...prev,
//       service_id: serviceId,
//       estimated_budget: service?.price || 0
//     }));
//   };

//   const handleNext = (e: React.FormEvent) => {
//     e.preventDefault();
//     setStep(2);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!customerId) return;
//     setLoading(true);

//     try {
//       const appointmentData = {
//         ...form,
//         customer_id: customerId,
//       };
//       await createAppointment(appointmentData);
//       onSuccess();
//       setForm({
//         appointment_date: '',
//         description: '',
//         estimated_budget: 0,
//         vehicle_id: 0,
//         service_id: 0,
//       });
//       setSelectedDate('');
//       setSelectedTime('');
//     } catch (error: any) {
//       alert(`Erro ao criar agendamento: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!show) return null;

//   return (
//     <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//       <div className="modal-dialog modal-lg">
//         <div className="modal-content shadow appointment-modal">
//           <div className="modal-header border-bottom">
//             <h5 className="modal-title fw-bold">
//               <i className="bi bi-calendar-plus me-2"></i>
//               Agendar Novo Serviço
//             </h5>
//             <button
//               type="button"
//               className="btn-close btn-close-white"
//               onClick={onClose}
//               aria-label="Close"
//             />
//           </div>

//           {/* centered progress bar */}
//           <div className="progress-center-wrapper">
//             <div className="progress-track" aria-hidden="true">
//               <div className="progress-fill" style={{ width: `${progress}%` }} />
//               <div
//                 className="car-icon"
//                 role="img"
//                 aria-label={`Progresso ${progress} por cento`}
//                 style={{ left: carLeft }}
//               >
//                 <i className="bi bi-car-front-fill" />
//               </div>
//             </div>

//             <div className="progress-instruction">
//               <strong>{instruction}</strong>
//             </div>

//             <div className="progress-percent">
//               {progress}% completo
//             </div>
//           </div>

//           {loadingData ? (
//             <div className="modal-body text-center py-5">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Carregando...</span>
//               </div>
//               <p className="mt-3 text-muted">Carregando dados da API...</p>
//             </div>
//           ) : error ? (
//             <div className="modal-body text-center py-5">
//               <div className="alert alert-danger">
//                 <i className="bi bi-exclamation-triangle me-2"></i>
//                 {error}
//               </div>
//               <button
//                 className="btn btn-primary"
//                 onClick={fetchData}
//               >
//                 <i className="bi bi-arrow-clockwise me-1"></i>
//                 Tentar Novamente
//               </button>
//             </div>
//           ) : (
//             <form onSubmit={step === 1 ? handleNext : handleSubmit}>
//               <div className="modal-body bg-white">
//                 <div className="row">
//                   {step === 1 && (
//                     <>
//                       {/* Serviço */}
//                       <div className="col-12 mb-3">
//                         <label className="form-label fw-semibold text-dark">
//                           <i className="bi bi-gear me-1 text-dark"></i>
//                           Serviço *
//                         </label>
//                         <select
//                           className="form-select border-2"
//                           value={form.service_id}
//                           onChange={(e) => handleServiceChange(parseInt(e.target.value))}
//                           required
//                         >
//                           <option value="">Selecione um serviço</option>
//                           {services.map(service => (
//                             <option key={service.id} value={service.id}>
//                               {service.name} - €{service.price}
//                               {service.description && ` (${service.description})`}
//                             </option>
//                           ))}
//                         </select>
//                         <div className="form-text text-info">
//                           <i className="bi bi-info-circle me-1"></i>
//                           Selecione o serviço pretendido.
//                         </div>
//                       </div>

//                       {/* Orçamento Estimado */}
//                       <div className="col-12 mb-3">
//                         <label className="form-label fw-semibold text-dark">
//                           <i className="bi bi-currency-euro me-1 text-dark"></i>
//                           Orçamento Estimado (€)
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           className="form-control border-2"
//                           value={form.estimated_budget}
//                           readOnly
//                           placeholder="0.00"
//                           required
//                         />
//                         <div className="form-text text-muted">
//                           <i className="bi bi-lightbulb me-1"></i>
//                         </div>
//                       </div>
//                     </>
//                   )}

//                   {step === 2 && (
//                     <>
//                       {/* Data e Hora */}
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label fw-semibold text-dark">
//                           <i className="bi bi-calendar-event me-1 text-dark"></i>
//                           Data *
//                         </label>
//                         <input
//                           type="date"
//                           className="form-control border-2 mb-2"
//                           value={selectedDate}
//                           onChange={(e) => {
//                             setSelectedDate(e.target.value);
//                             updateDateTime(e.target.value, selectedTime);
//                           }}
//                           min={new Date().toISOString().split('T')[0]}
//                           style={{ cursor: 'pointer', fontSize: '1rem' }}
//                           onClick={(e) => { (e.target as HTMLInputElement).showPicker?.(); }}
//                           required
//                         />
//                         <label className="form-label fw-semibold text-dark">
//                           <i className="bi bi-clock me-1 text-dark"></i>
//                           Hora *
//                         </label>
//                         <input
//                           type="time"
//                           className="form-control border-2"
//                           value={selectedTime}
//                           onChange={(e) => {
//                             setSelectedTime(e.target.value);
//                             updateDateTime(selectedDate, e.target.value);
//                           }}
//                           style={{ cursor: 'pointer', fontSize: '1rem' }}
//                           onClick={(e) => { (e.target as HTMLInputElement).showPicker?.(); }}
//                           required
//                         />
//                         {form.appointment_date && (
//                           <div className="form-text text-success mt-2">
//                             <i className="bi bi-check-circle me-1"></i>
//                             <strong>Agendado para:</strong> {new Date(form.appointment_date).toLocaleString('pt-PT')}
//                           </div>
//                         )}
//                       </div>

//                       {/* Veículo */}
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label fw-semibold text-dark">
//                           <i className="bi bi-car-front me-1 text-dark"></i>
//                           Veículo *
//                         </label>
//                         <select
//                           className="form-select border-2"
//                           value={form.vehicle_id}
//                           onChange={(e) => setForm(prev => ({ ...prev, vehicle_id: parseInt(e.target.value) }))}
//                           required
//                         >
//                           <option value="">Selecione um veículo</option>
//                           {vehicles.map(vehicle => (
//                             <option key={vehicle.id} value={vehicle.id}>
//                               {vehicle.brand} {vehicle.model} - {vehicle.plate}
//                             </option>
//                           ))}
//                         </select>
//                         {vehicles.length === 0 && !loadingData && (
//                           <div className="form-text text-warning">
//                             <i className="bi bi-exclamation-triangle me-1"></i>
//                             Nenhum veículo encontrado para este cliente
//                           </div>
//                         )}
//                         {vehicles.length > 0 && (
//                           <div className="form-text text-success">
//                             <i className="bi bi-check-circle me-1"></i>
//                           </div>
//                         )}
//                       </div>

//                       {/* Descrição */}
//                       <div className="col-12 mb-3">
//                         <label className="form-label fw-semibold text-dark">
//                           <i className="bi bi-text-paragraph me-1 text-dark"></i>
//                           Descrição *
//                         </label>
//                         <textarea
//                           className="form-control border-2"
//                           rows={3}
//                           value={form.description}
//                           onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
//                           placeholder="Descreva o problema ou serviço necessário..."
//                           required
//                         />
//                       </div>

//                       {/* Info do Cliente */}
//                       <div className="col-12">
//                         <div className="alert alert-light border border-primary">
//                           <i className="bi bi-info-circle me-2 text-primary"></i>
//                           <strong className="text-dark">Cliente:</strong>
//                           <span className="text-muted"> ID {customerId}</span>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//               <div className="modal-footer border-top">
//                 <button
//                   type="button"
//                   className="btn btn-outline-light"
//                   onClick={onClose}
//                 >
//                   <i className="bi bi-x-circle me-1"></i>
//                   Cancelar
//                 </button>
//                 {step === 1 ? (
//                   <button
//                     type="submit"
//                     className="btn btn-light text-danger"
//                     disabled={!form.service_id || !form.estimated_budget}
//                   >
//                     Seguinte
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     className="btn btn-light text-danger"
//                     disabled={
//                       loading || loadingData ||
//                       vehicles.length === 0 ||
//                       !form.appointment_date ||
//                       !form.vehicle_id ||
//                       !form.description
//                     }
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2"></span>
//                         Criando...
//                       </>
//                     ) : (
//                       <>
//                         <i className="bi bi-check-circle me-1"></i>
//                         Agendar Serviço
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// ...existing code...
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomerVehicles, createAppointment, getServices } from '../services/customerService';
import '../styles/appointmentModal.css';
import { useAuth } from '../api/auth';

interface CreateAppointmentModalProps {
  show: boolean;
  onClose: () => void;
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

export function CreateAppointmentModal({ show, onClose, onSuccess }: CreateAppointmentModalProps) {
  const { t } = useTranslation();
  const auth = useAuth();
  const customerId: number | null = auth?.loggedInCustomerId ?? null;

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

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState(1);

  const updateDateTime = (date: string, time: string) => {
    if (date && time) {
      const dateTime = `${date}T${time}`;
      setForm(prev => ({ ...prev, appointment_date: dateTime }));
    } else {
      setForm(prev => ({ ...prev, appointment_date: '' }));
    }
  };

  // progresso (percent)
  const progress = useMemo(() => {
    const checks = [
      !!form.service_id,
      !!form.estimated_budget && form.estimated_budget > 0,
      !!selectedDate,
      !!selectedTime,
      !!form.vehicle_id,
      !!form.description && form.description.trim().length > 3,
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [form.service_id, form.estimated_budget, selectedDate, selectedTime, form.vehicle_id, form.description]);

  // carLeft dentro do track (constrange para não sair dos limites)
  const carLeft = useMemo(() => {
    const start = 1;
    const end = 99;
    const pct = Math.max(0, Math.min(100, progress));
    return `${start + ((end - start) * pct) / 100}%`;
  }, [progress]);

  // instrução dinâmica (um passo de cada vez) -> usa traduções com defaultValue
  const instruction = useMemo(() => {
    if (step === 1) {
      if (!form.service_id) return t('appointmentModal.selectServicePlaceholder', { defaultValue: 'Selecione o serviço' });
      const svc = services.find(s => s.id === form.service_id);
      return svc
        ? t('appointmentModal.serviceSelected', { service: svc.name, defaultValue: `Serviço: ${svc.name} — clique Seguinte` })
        : t('appointmentModal.serviceSelectedFallback', { defaultValue: 'Serviço selecionado — clique Seguinte' });
    }

    if (!selectedDate || !selectedTime) return t('appointmentModal.chooseDateTime', { defaultValue: 'Escolha data e hora' });
    if (!form.vehicle_id) return t('appointmentModal.selectVehicle', { defaultValue: 'Selecione um veículo' });
    if (!form.description || form.description.trim().length <= 3) return t('appointmentModal.describeProblem', { defaultValue: 'Descreva o problema (mín. 4 caracteres)' });
    return t('appointmentModal.readyToSubmit', { defaultValue: 'Tudo preenchido — pode enviar o agendamento' });
  }, [step, form.service_id, services, selectedDate, selectedTime, form.vehicle_id, form.description, t]);

  useEffect(() => {
    if (show) {
      setStep(1);
      setForm({
        appointment_date: '',
        description: '',
        estimated_budget: 0,
        vehicle_id: 0,
        service_id: 0,
      });
      setSelectedDate('');
      setSelectedTime('');
      fetchData();
    }
  }, [show, customerId]);

  const fetchData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const servicesData = await getServices();
      setServices(servicesData);

      if (customerId) {
        const vehiclesData = await getCustomerVehicles(customerId);
        setVehicles(vehiclesData);
      } else {
        setVehicles([]);
      }
    } catch (err: any) {
      setError(t('errorLoadingServices', { defaultValue: `Erro ao carregar dados: ${err.message}` }));
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
    if (!customerId) return;
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
    } catch (err: any) {
      alert(t('appointmentModal.errorCreating', { defaultValue: `Erro ao criar agendamento: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow appointment-modal">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-calendar-plus me-2"></i>
              {t('appointmentModal.title', { defaultValue: 'Agendar Novo Serviço' })}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label={t('close', { defaultValue: 'Close' })}
            />
          </div>

          {/* centered progress bar */}
          <div className="progress-center-wrapper">
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <div
                className="car-icon"
                role="img"
                aria-label={t('appointmentModal.progressAria', { percent: progress, defaultValue: `Progresso ${progress} por cento` })}
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

          {loadingData ? (
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('loading', { defaultValue: 'Carregando...' })}</span>
              </div>
              <p className="mt-3 text-muted">{t('appointmentModal.loadingApi', { defaultValue: 'Carregando dados da API...' })}</p>
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
                {t('appointmentModal.tryAgain', { defaultValue: 'Tentar Novamente' })}
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
                          <i className="bi bi-gear me-1 text-dark"></i>
                          {t('service', { defaultValue: 'Serviço' })} *
                        </label>
                        <select
                          className="form-select border-2"
                          value={form.service_id}
                          onChange={(e) => handleServiceChange(parseInt(e.target.value))}
                          required
                        >
                          <option value="">{t('appointmentModal.selectServicePlaceholder', { defaultValue: 'Selecione um serviço' })}</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name} - €{service.price}
                              {service.description && ` (${service.description})`}
                            </option>
                          ))}
                        </select>
                        <div className="form-text text-info">
                          <i className="bi bi-info-circle me-1"></i>
                          {t('appointmentModal.selectServiceHelp', { defaultValue: 'Selecione o serviço pretendido.' })}
                        </div>
                      </div>

                      {/* Orçamento Estimado */}
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-currency-euro me-1 text-dark"></i>
                          {t('appointmentModal.estimatedBudget', { defaultValue: 'Orçamento Estimado (€)' })}
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
                          min={new Date().toISOString().split('T')[0]}
                          style={{ cursor: 'pointer', fontSize: '1rem' }}
                          onClick={(e) => { (e.target as HTMLInputElement).showPicker?.(); }}
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
                          onClick={(e) => { (e.target as HTMLInputElement).showPicker?.(); }}
                          required
                        />
                        {form.appointment_date && (
                          <div className="form-text text-success mt-2">
                            <i className="bi bi-check-circle me-1"></i>
                            <strong>{t('appointmentModal.scheduledFor', { defaultValue: 'Agendado para:' })}</strong> {new Date(form.appointment_date).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Veículo */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-car-front me-1 text-dark"></i>
                          {t('vehicle', { defaultValue: 'Veículo' })} *
                        </label>
                        <select
                          className="form-select border-2"
                          value={form.vehicle_id}
                          onChange={(e) => setForm(prev => ({ ...prev, vehicle_id: parseInt(e.target.value) }))}
                          required
                        >
                          <option value="">{t('appointmentModal.selectVehiclePlaceholder', { defaultValue: 'Selecione um veículo' })}</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model} - {vehicle.plate}
                            </option>
                          ))}
                        </select>
                        {vehicles.length === 0 && !loadingData && (
                          <div className="form-text text-warning">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {t('appointmentModal.noVehiclesFound', { defaultValue: 'Nenhum veículo encontrado para este cliente' })}
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
                          <i className="bi bi-text-paragraph me-1 text-dark"></i>
                          {t('description', { defaultValue: 'Descrição' })} *
                        </label>
                        <textarea
                          className="form-control border-2"
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={t('appointmentModal.descriptionPlaceholder', { defaultValue: 'Descreva o problema ou serviço necessário...' })}
                          required
                        />
                      </div>

                      {/* Info do Cliente */}
                      <div className="col-12">
                        <div className="alert alert-light border border-primary">
                          <i className="bi bi-info-circle me-2 text-primary"></i>
                          <strong className="text-dark">{t('appointmentModal.clientLabel', { defaultValue: 'Cliente:' })}</strong>
                          <span className="text-muted"> ID {customerId}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

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
                    {t('appointmentModal.next', { defaultValue: 'Seguinte' })}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-light text-danger"
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
                        {t('appointmentModal.creating', { defaultValue: 'Criando...' })}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        {t('appointmentModal.createAppointment', { defaultValue: 'Agendar Serviço' })}
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
