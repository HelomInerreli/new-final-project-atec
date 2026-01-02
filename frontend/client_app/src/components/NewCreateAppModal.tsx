import { useTranslation } from 'react-i18next';
import { LucideCalendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import type { CreateAppointmentModalProps } from '../interfaces/appointment';
import { useAppointmentModal } from '../hooks/useAppointmentModal';
import { generateTimeSlots } from '../utils/timeSlots';
import { locales } from '../utils/locales';
import { pt } from 'date-fns/locale';

/**
 * Modal de criação de agendamento com formulário em 3 etapas
 * Step 1: Seleção de data, horário e serviço
 * Step 2: Seleção de veículo e descrição
 * Step 3: Confirmação e resumo dos dados
 * Redireciona para login se o utilizador não estiver autenticado
 * @param show - Estado de visibilidade do modal
 * @param onClose - Função callback para fechar o modal
 * @param onSuccess - Função callback executada após criação bem-sucedida
 * @returns Componente JSX do modal ou null se não estiver visível
 */
export const NewCreateAppModal: React.FC<CreateAppointmentModalProps> = ({ show, onClose, onSuccess }) => {
    /**
     * Hook de tradução para internacionalização
     */
    const { t, i18n } = useTranslation();
    
    /**
     * Gera lista de horários disponíveis para agendamento
     */
    const timeSlots = generateTimeSlots();
    
    /**
     * Hook customizado que gere toda a lógica do modal de agendamento
     * Retorna estados do formulário, dados de veículos/serviços, e funções de navegação/submissão
     */
    const {
        currentStep,
        loading,
        error,
        formData,
        setFormData,
        vehicles,
        services,
        selectData,
        setSelectData,
        selectedTime,
        setSelectedTime,
        isLoggedIn,
        goToNextStep,
        goToPreviousStep,
        handleSubmit,
        handleClose,
        isTimeSlotAvailable,
        getInitialDate,
    } = useAppointmentModal(show, onSuccess, onClose);

    if (!show) {
        return null;
    }
    
    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
        >
            {/* Container do modal */}
            <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    {/* Cabeçalho do modal com título e botão de fecho */}
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {t('appointmentModal.createAppointment', { defaultValue: 'Criar Agendamento' })}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            aria-label="Fechar"
                        ></button>
                    </div>

                    {/* Barra de progresso com indicador do passo atual */}
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

                    {/* Corpo do modal com formulário de 3 etapas */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>

                            {/* Step 1: Seleção de data, horário e serviço */}
                            {currentStep === 1 && (
                                <>
                                    {/* Campo de seleção de data com DatePicker */}
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

                                    {/* Campo de seleção de horário */}
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

                                    {/* Campo de seleção de serviço com preço */}
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

                                    {/* Aviso para utilizadores não autenticados */}
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

                            {/* Step 2: Seleção de veículo e descrição do problema */}
                            {currentStep === 2 && (<>

                                {/* Campo de seleção de veículo */}
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

                                {/* Campo de texto para descrição do problema */}
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

                            {/* Step 3: Resumo e confirmação dos dados do agendamento */}
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

                            {/* Mensagem de erro (se houver) */}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-circle me-2"></i>
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Rodapé do modal com botões de navegação entre steps */}
                    <div className="modal-footer">
                        {/* Botões do Step 1: Cancelar e Próximo/Login */}
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
                                    {/* Texto dinâmico: login ou próximo */}
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

                        {/* Botões do Step 2: Voltar e Próximo */}
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

                        {/* Botões do Step 3: Voltar e Confirmar */}
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
