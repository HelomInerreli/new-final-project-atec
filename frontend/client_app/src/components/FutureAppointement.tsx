import { useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaTools } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useFutureAppointments } from '../hooks/useFutureAppointments';
import { formatDate } from '../utils/dateUtils';
import '../styles/FutureAppointments.css';
import { createAppointmentCheckoutSession } from '../services/payment';
import { AppointmentStatusModal } from './AppointmentDetailsModal';
import type { Appointment } from '../interfaces/appointment';

/**
 * Componente para exibir agendamentos futuros agrupados por mês
 * Mostra lista de agendamentos organizados cronologicamente, com opções de pagamento e detalhes
 * Permite expandir/colapsar meses e visualizar detalhes completos de cada agendamento
 * @returns Componente JSX da página de agendamentos futuros
 */
export function FutureAppointments() {
    /**
     * Hook de tradução para internacionalização
     */
    const { t } = useTranslation();
    
    /**
     * Hook customizado que retorna agendamentos agrupados por mês, estado de loading e erros
     */
    const { groupedAppointments, loading, error } = useFutureAppointments();
    
    /**
     * Estado para controlar quais meses estão expandidos
     * Tipo: Record de string (chave: monthYear) para boolean (expandido ou não)
     * Inicial: objeto vazio (todos os meses colapsados)
     */
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
    
    /**
     * Estado para rastrear qual agendamento está a processar o checkout de pagamento
     * Tipo: number | null (ID do agendamento ou null)
     * Usado para exibir loading no botão de pagamento correto
     */
    const [checkoutLoadingId, setCheckoutLoadingId] = useState<number | null>(null);
    
    /**
     * Estado para armazenar mensagem de erro relacionada com pagamento
     * Tipo: string | null
     * Inicial: null (sem erros)
     */
    const [paymentError, setPaymentError] = useState<string | null>(null);
    
    /**
     * Estado para armazenar o agendamento atualmente selecionado para visualização detalhada
     * Tipo: Appointment | null
     * Inicial: null (nenhum agendamento selecionado)
     */
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    /**
     * Alterna o estado de expansão de um determinado mês
     * @param monthYear - Identificador do mês no formato "mês ano" (ex: "janeiro 2025")
     */
    const toggleMonth = (monthYear: string) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthYear]: !prev[monthYear]
        }));
    };

    /**
     * Inicia o processo de checkout de pagamento para um agendamento
     * Cria sessão de checkout no Stripe e redireciona o utilizador
     * @param appointmentId - ID do agendamento a pagar
     */
    const handlePaymentClick = async (appointmentId: number) => {
        try {
            setPaymentError(null);
            setCheckoutLoadingId(appointmentId);
            const checkoutUrl = await createAppointmentCheckoutSession(appointmentId);
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error('Failed to start checkout', err);
            setPaymentError(t('appointmentsPage.paymentInitFailed', { defaultValue: 'Não foi possível iniciar o pagamento.' }));
            setCheckoutLoadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="appointments-page">
                {/* Indicador de carregamento */}
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('loading')}...</span>
                    </div>
                    <p className="mt-3 text-primary">{t('loadingServices')}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-page">
            {/* Alerta de erro se houver falha ao carregar agendamentos */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* Estado vazio quando não há agendamentos */}
            {!error && Object.keys(groupedAppointments).length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <FaCalendarAlt size={80} />
                    </div>
                    <h3>{t('noServicesFound')}</h3>
                    <p>{t('appointmentsPage.noAppointmentsDescription')}</p>
                </div>
            )}

            {/* Lista de agendamentos agrupados por mês */}
            {!error && Object.keys(groupedAppointments).length > 0 && (
                <div className="grouped-appointments">
                    {Object.entries(groupedAppointments).map(([monthYear, appointments]) => (
                        <div key={monthYear} className="month-section">
                            {/* Cabeçalho do mês com contador e botão de expandir */}
                            <div 
                                className="month-header"
                                onClick={() => toggleMonth(monthYear)}
                            >
                                <div className="month-header-content">
                                    <h2 className="month-title">
                                        {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                                    </h2>
                                    <span className="appointment-count">
                                        {appointments.length} {appointments.length === 1 ? t('appointment') : t('appointments')}
                                    </span>
                                </div>
                                <span className={`toggle-icon ${expandedMonths[monthYear] ? 'expanded' : ''}`}>
                                    ❯
                                </span>
                            </div>

                            {/* Lista de agendamentos do mês (exibida apenas se expandido) */}
                            {expandedMonths[monthYear] && (
                                <div className="appointments-list">
                                    {appointments.map((appointment) => {
                                        const statusName = appointment.status?.name || t('scheduled');
                                        const normalizedStatus = statusName.toLowerCase().replace(/\s+/g, '-');
                                        const statusClassName = `status-${normalizedStatus || 'default'}`;
                                        const isWaitingPayment = normalizedStatus === 'waitting-payment';

                                        return (
                                            <div key={appointment.id} className="appointment-card">
                                                {/* Cabeçalho do card com ícone e badge de status */}
                                                <div className="appointment-card-header">
                                                    <div className="appointment-icon">
                                                        <FaCheckCircle size={32} />
                                                    </div>
                                                    <div className="appointment-status">
                                                        <span className={`status-badge ${statusClassName}`}>
                                                            {statusName.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Corpo do card com informações do agendamento */}
                                                <div className="appointment-card-body">
                                                    {/* Nome do serviço */}
                                                    <h3 className="appointment-service">
                                                        <FaTools className="me-2" />
                                                        {appointment.service?.name || t('service')}
                                                    </h3>

                                                    {/* Informações detalhadas do agendamento */}
                                                    <div className="appointment-info">
                                                        {/* Data do agendamento */}
                                                        <div className="info-item">
                                                            <FaCalendarAlt className="info-icon" />
                                                            <div>
                                                                <span className="info-label">{t('appointmentDate').toUpperCase()}</span>
                                                                <span className="info-value">{formatDate(appointment.appointment_date)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Descrição */}
                                                        <div className="info-item">
                                                            <span className="info-label">{t('description').toUpperCase()}</span>
                                                            <p className="info-description">
                                                                {appointment.description || t('noDescription')}
                                                            </p>
                                                        </div>

                                                        {/* Orçamento estimado (condicional) */}
                                                        {appointment.estimated_budget && (
                                                            <div className="appointment-budget">
                                                                <div className="budget-item">
                                                                    <span className="budget-label">{t('estimatedBudget').toUpperCase()}</span>
                                                                    <span className="budget-value text-muted">€{appointment.estimated_budget.toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Rodapé do card com botões de ação */}
                                                <div className="appointment-card-footer d-flex gap-2">
                                                    {/* Botão de pagamento (apenas para status "aguardando pagamento") */}
                                                    {isWaitingPayment && (
                                                        <button
                                                            type="button"
                                                            className="payment-button"
                                                            disabled={checkoutLoadingId === appointment.id}
                                                            onClick={() => handlePaymentClick(appointment.id)}
                                                        >
                                                            {checkoutLoadingId === appointment.id
                                                                ? t('appointmentsPage.redirectingPayment', { defaultValue: 'A redirecionar…' })
                                                                : t('appointmentsPage.goToPayment', { defaultValue: 'Ir para pagamento' })}
                                                        </button>
                                                    )}

                                                    {/* Botão para ver detalhes do agendamento */}
                                                    <button
                                                        className={`btn btn-primary ${isWaitingPayment ? '' : 'w-100'}`}
                                                        onClick={() => setSelectedAppointment(appointment)}
                                                    >
                                                        {t('viewDetails', { defaultValue: 'Ver Detalhes' })}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Alerta de erro de pagamento */}
            {paymentError && (
                <div className="alert alert-warning" role="alert">
                    {paymentError}
                </div>
            )}

            {/* Modal de detalhes do agendamento */}
            <AppointmentStatusModal
                appointment={selectedAppointment}
                open={!!selectedAppointment}
                onOpenChange={(open: boolean) => !open && setSelectedAppointment(null)}
            />
        </div>
    );
}
