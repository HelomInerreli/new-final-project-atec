import { useState, useEffect } from 'react';
import { useAuth } from '../api/auth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // ✅ ADICIONAR
import type { AppointmentForm, CreateAppointmentData, CreateAppointmentModalProps } from '../interfaces/appointment';
import http from '../api/http';
import { vehicleService } from '../services/vehicleServices';
import type { Vehicle } from '../interfaces/vehicle';
import { LucideCalendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { pt, fr, es, enUS } from 'date-fns/locale';
import { formatDate } from '../utils/dateUtils';
import { h5 } from 'framer-motion/m';
import type { Locale } from 'date-fns';

const locales: { [key: string]: Locale } = {
    pt: pt,
    fr: fr,
    es: es,
    en: enUS
};

interface Service {
    id: number;
    name: string;
    description: string | null;  // ✅
    price: number;
    duration_minutes: number | null;  // ✅
    is_active: boolean;
};

const getServices = async (): Promise<Service[]> => {
    const response = await http.get('/services');
    return response.data;
}

export const NewCreateAppModal: React.FC<CreateAppointmentModalProps> = ({ show, onClose, onSuccess }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate(); // ✅ ADICIONAR
    const [currentStep, setCurrentStep] = useState<number>(1);
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AppointmentForm>({
        appointment_date: '',
        description: '',
        estimated_budget: 0,
        vehicle_id: 0,
        service_id: 0,
    });
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const getInitialDate = () => {
        const now = new Date();
        if (now.getHours() >= 17) {
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            return tomorrow;
        }
        return now;
    };

    const [selectData, setSelectData] = useState<Date | null>(getInitialDate());
    const [selectedTime, setSelectedTime] = useState<string>('09:00');

    const timeSlots: string[] = [];

    for (let hour = 9; hour <= 17; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 17) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    const goToNextStep = () => {
        if (currentStep === 1) {
            // ✅ VERIFICAR LOGIN PRIMEIRO (antes da validação)
            if (!isLoggedIn) {
                navigate('/register', {
                    state: {
                        message: t('appointmentModal.loginRequired', { defaultValue: 'Por favor, faça login para agendar um serviço' }),
                        returnTo: '/appointments'
                    }
                });
                onClose(); // Fecha o modal DEPOIS do navigate
                return;
            }

            // Validação SÓ se estiver logado
            if (!formData.service_id || !selectData || !selectedTime) {
                setError(t('appointmentModal.errorStep1', { defaultValue: 'Preencha todos os campos obrigatórios do passo 1' }));
                return;
            }

            // Combinar data + hora no appointment_date
            const dateTime = new Date(selectData);
            const [hours, minutes] = selectedTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes));

            setFormData(prev => ({
                ...prev,
                appointment_date: dateTime.toISOString()
            }));

            setError(null);
            setCurrentStep(2);
        }

        if (currentStep === 2) {
            if (!formData.vehicle_id) {
                setError(t('appointmentModal.errorVehicle', { defaultValue: 'Selecione um veículo' }));
                return;
            }
            setError(null);
            setCurrentStep(3);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    }

    const createAppointment = async (appointmentData: CreateAppointmentData) => {
        try {
            console.log("Criando appointment:", appointmentData);
            const response = await http.post("/appointments", appointmentData);
            console.log("Appointment criado:", response.data);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar appointment:", error);
            throw error;
        }
    };

    // ✅ Função para verificar se o horário está disponível
    const isTimeSlotAvailable = (time: string): boolean => {
        if (!selectData) return true;

        const selectedDate = new Date(selectData);
        const today = new Date();

        // Se a data selecionada não é hoje, todos os horários estão disponíveis
        if (selectedDate.toDateString() !== today.toDateString()) {
            return true;
        }

        // Se é hoje, verificar se o horário já passou
        const [hours, minutes] = time.split(':').map(Number);
        const currentHour = today.getHours();
        const currentMinutes = today.getMinutes();

        // Horário já passou
        if (hours < currentHour) {
            return false;
        }

        // Mesma hora mas minutos já passaram
        if (hours === currentHour && minutes <= currentMinutes) {
            return false;
        }

        return true;
    };

    useEffect(() => {
        if (!isLoggedIn || !loggedInCustomerId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const vehicles = await vehicleService.getByCustomer(loggedInCustomerId);
                setVehicles(vehicles);
                const services = await getServices();
                setServices(services);
                setLoading(false);
            }
            catch (error) {
                setError(t('appointmentModal.errorLoad', { defaultValue: 'Erro ao carregar dados' }));
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoggedIn, loggedInCustomerId]);

    // ✅ NOVO useEffect específico para validar horário quando a data muda
    useEffect(() => {
        if (selectData && !isTimeSlotAvailable(selectedTime)) {
            // Encontrar o primeiro horário disponível
            const availableTime = timeSlots.find(time => isTimeSlotAvailable(time));
            if (availableTime) {
                setSelectedTime(availableTime);
            }
        }
    }, [selectData]); // Executa quando selectData muda

    const isTodayAndAfterLastSlot = () => {
        if (!selectData) return false;
        const now = new Date();
        const selected = new Date(selectData);
        return (
            selected.toDateString() === now.toDateString() &&
            now.getHours() >= 17
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn || !loggedInCustomerId) {
            setError(t('appointmentModal.errorLogin', { defaultValue: 'Usuário não está logado' }));
            return;
        }

        if (!formData.vehicle_id || !formData.service_id || !formData.appointment_date) {
            setError(t('appointmentModal.errorAllFields', { defaultValue: 'Preencha todos os campos obrigatórios' }));
            return;
        }
        try {
            setLoading(true);
            const appointmentData: CreateAppointmentData = {
                ...formData,
                customer_id: loggedInCustomerId,
            };
            await createAppointment(appointmentData);
            onSuccess();
            resetForm();
            handleClose();
        } catch (error) {
            setError(t('appointmentModal.errorCreate', { defaultValue: 'Erro ao criar agendamento' }));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            appointment_date: '',
            description: '',
            estimated_budget: 0,
            vehicle_id: 0,
            service_id: 0,
        });
        setSelectData(getInitialDate());
        setSelectedTime('09:00');
        setCurrentStep(1);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    {/* Progress Bar */}

                    {/* Cabeçalho */}
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {t('createAppointment', { defaultValue: 'Criar Agendamento' })}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            aria-label="Fechar"
                        ></button>
                    </div>

                    <div className="px-3 pt-4 pb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-medium">
                                {currentStep === 1 ? t('appointmentModal.step1Title', { defaultValue: 'Selecione o serviço e horário' }) : currentStep === 2 ? t('appointmentModal.step2Title', { defaultValue: 'Escolha o veículo' }) : t('appointmentModal.step3Title', { defaultValue: 'Confirme os detalhes' })}
                            </span>
                            <span className="text-muted small">
                                {t('appointmentModal.progress', { percent: Math.round((currentStep / 3) * 100), defaultValue: '{{percent}}% completo' })}
                            </span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '50rem', backgroundColor: '#e9ecef' }}>
                            <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{
                                    width: `${(currentStep / 3) * 100}%`,
                                    transition: 'width 0.3s ease-in-out',
                                    borderRadius: '50rem'
                                }}
                                aria-valuenow={currentStep}
                                aria-valuemin={1}
                                aria-valuemax={3}
                            ></div>
                        </div>
                    </div>

                    {/* Corpo */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>

                            {currentStep === 1 && (
                                <>
                                    {/* Data */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <LucideCalendar size={16} className="me-1" />
                                            {t('appointmentModal.dateLabel', { defaultValue: 'Data *' })}
                                        </label>
                                        <DatePicker
                                            selected={selectData}
                                            onChange={date => setSelectData(date)}
                                            dateFormat="dd/MM/yyyy"
                                            minDate={getInitialDate()}
                                            filterDate={date => date.getDay() !== 0}
                                            className="form-control"
                                            locale={locales[i18n.language] || pt}
                                        />
                                    </div>

                                    {/* Horário */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t('appointmentModal.timeLabel', { defaultValue: 'Horário *' })}</label>
                                        <select
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="form-select"
                                        >
                                            {timeSlots
                                                .filter(time => isTimeSlotAvailable(time))
                                                .map(time => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        {selectData && selectData.toDateString() === new Date().toDateString() && (
                                            <small className="form-text text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                {t('appointmentModal.pastTimesUnavailable', { defaultValue: 'Horários passados não estão disponíveis' })}
                                            </small>
                                        )}
                                    </div>

                                    {/* Serviço */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-wrench me-1"></i>
                                            {t('service', { defaultValue: 'Serviço' })} *
                                        </label>
                                        <select
                                            className="form-select"
                                            value={formData.service_id}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    service_id: parseInt(e.target.value)
                                                }))
                                            }
                                            required
                                        >
                                            <option value="">
                                                {t('appointmentModal.selectServicePlaceholder', {
                                                    defaultValue: 'Selecione um serviço'
                                                })}
                                            </option>
                                            {services.map(service => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} - {service.price}€
                                                </option>
                                            ))}
                                        </select>
                                        {services.length === 0 && !loading && (
                                            <div className="form-text text-warning">
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                {t('appointmentModal.noServicesFound', { defaultValue: 'Nenhum serviço encontrado' })}
                                            </div>
                                        )}
                                    </div>

                                    {/* ✅ ADICIONAR AVISO SE NÃO ESTIVER LOGADO */}
                                    {!isLoggedIn && (
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
                                    )}
                                </>
                            )}

                            {currentStep === 2 && (<>

                                {/* Veículo */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-car-front me-1"></i>
                                        {t('vehicle', { defaultValue: 'Veículo' })} *
                                    </label>
                                    <select
                                        className="form-select"
                                        value={formData.vehicle_id}
                                        onChange={(e) =>
                                            setFormData(prev => ({
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
                                    {vehicles.length === 0 && !loading && (
                                        <div className="form-text text-warning">
                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                            {t('appointmentModal.noVehiclesFound', {
                                                defaultValue: 'Nenhum veículo encontrado'
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Descrição */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('appointmentModal.descriptionLabel', { defaultValue: 'Descrição' })}</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))
                                        }
                                        placeholder={t('appointmentModal.descriptionPlaceholder', { defaultValue: 'Descreva o problema ou serviço necessário...' })}
                                    />
                                </div>
                            </>
                            )}

                            {currentStep === 3 && (
                                <div className="bg-light rounded p-4 border">
                                    <h5 className="fw-bold text-danger mb-3">
                                        {t('appointmentModal.summaryTitle', { defaultValue: 'Resumo do Agendamento' })}
                                    </h5>
                                    <div className="d-flex flex-column gap-2 small">
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">{t('appointmentModal.serviceLabel', { defaultValue: 'Serviço:' })}</span>
                                            <span className="fw-medium">
                                                {services.find(s => s.id === formData.service_id)?.name || '-'}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">{t('appointmentModal.dateLabelSummary', { defaultValue: 'Data:' })}</span>
                                            <span className="fw-medium">
                                                {selectData?.toLocaleDateString('pt-PT')}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">{t('appointmentModal.timeLabelSummary', { defaultValue: 'Hora:' })}</span>
                                            <span className="fw-medium">{selectedTime}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">{t('appointmentModal.vehicleLabelSummary', { defaultValue: 'Veículo:' })}</span>
                                            <span className="fw-medium">
                                                {vehicles.find(v => v.id === formData.vehicle_id)?.brand}{' '}
                                                {vehicles.find(v => v.id === formData.vehicle_id)?.model}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">{t('appointmentModal.plateLabelSummary', { defaultValue: 'Matrícula:' })}</span>
                                            <span className="fw-medium">
                                                {vehicles.find(v => v.id === formData.vehicle_id)?.plate}
                                            </span>
                                        </div>
                                        {formData.description && (
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">{t('appointmentModal.descriptionLabelSummary', { defaultValue: 'Descrição:' })}</span>
                                                <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>
                                                    {formData.description}
                                                </span>
                                            </div>
                                        )}
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-semibold">{t('appointmentModal.estimatedPriceLabel', { defaultValue: 'Preço Estimado:' })}</span>
                                            <span className="fw-bold text-success">
                                                {services.find(s => s.id === formData.service_id)?.price}€
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Erro */}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-circle me-2"></i>
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Rodapé */}
                    <div className="modal-footer">
                        {currentStep === 1 && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                >
                                    {t('appointmentModal.cancelButton', { defaultValue: 'Cancelar' })}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={goToNextStep}
                                    disabled={isLoggedIn && (!formData.service_id || !selectData || !selectedTime)}
                                >
                                    {/* ✅ TEXTO DINÂMICO NO BOTÃO */}
                                    {!isLoggedIn ? (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-1"></i>
                                            {t('appointmentModal.loginToContinue', {
                                                defaultValue: 'Fazer Login para Continuar'
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {t('appointmentModal.nextButton', { defaultValue: 'Próximo' })}
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={goToPreviousStep}
                                >
                                    {t('appointmentModal.backButton', { defaultValue: 'Voltar' })}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={goToNextStep}
                                >
                                    {t('appointmentModal.nextButton', { defaultValue: 'Próximo' })}
                                </button>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={goToPreviousStep}
                                >
                                    {t('appointmentModal.backButton', { defaultValue: 'Voltar' })}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            {t('appointmentModal.creatingButton', { defaultValue: 'A criar...' })}
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle text-white me-2"></i>
                                            {t('appointmentModal.confirmButton', { defaultValue: 'Confirmar Agendamento' })}
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
}
