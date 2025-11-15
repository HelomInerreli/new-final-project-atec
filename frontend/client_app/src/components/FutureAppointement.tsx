import { useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaTools } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useFutureAppointments } from '../hooks/useFutureAppointments';
import { formatDate } from '../utils/dateUtils';
import '../styles/FutureAppointments.css';
import { createAppointmentCheckoutSession } from '../services/payment';
import { AppointmentStatusModal } from './AppointmentDetailsModal';
import type { Appointment } from '../interfaces/appointment';

export function FutureAppointments() {
    const { t } = useTranslation();
    const { groupedAppointments, loading, error } = useFutureAppointments();
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
    const [checkoutLoadingId, setCheckoutLoadingId] = useState<number | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const toggleMonth = (monthYear: string) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthYear]: !prev[monthYear]
        }));
    };

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
            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {!error && Object.keys(groupedAppointments).length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <FaCalendarAlt size={80} />
                    </div>
                    <h3>{t('noServicesFound')}</h3>
                    <p>{t('appointmentsPage.noAppointmentsDescription')}</p>
                </div>
            )}

            {!error && Object.keys(groupedAppointments).length > 0 && (
                <div className="grouped-appointments">
                    {Object.entries(groupedAppointments).map(([monthYear, appointments]) => (
                        <div key={monthYear} className="month-section">
                            <div 
                                className="month-header"
                                onClick={() => toggleMonth(monthYear)}
                            >
                                <div className="month-header-content">
                                    <h2 className="month-title">{monthYear}</h2>
                                    <span className="appointment-count">
                                        {appointments.length} {appointments.length === 1 ? t('appointment') : t('appointments')}
                                    </span>
                                </div>
                                <span className={`toggle-icon ${expandedMonths[monthYear] ? 'expanded' : ''}`}>
                                    ❯
                                </span>
                            </div>

                            {expandedMonths[monthYear] && (
                                <div className="appointments-list">
                                    {appointments.map((appointment) => {
                                        const statusName = appointment.status?.name || t('scheduled');
                                        const normalizedStatus = statusName.toLowerCase().replace(/\s+/g, '-');
                                        const statusClassName = `status-${normalizedStatus || 'default'}`;
                                        const isWaitingPayment = normalizedStatus === 'waitting-payment';

                                        return (
                                            <div key={appointment.id} className="appointment-card">
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

                                                <div className="appointment-card-body">
                                                    <h3 className="appointment-service">
                                                        <FaTools className="me-2" />
                                                        {appointment.service?.name || t('service')}
                                                    </h3>

                                                    <div className="appointment-info">
                                                        <div className="info-item">
                                                            <FaCalendarAlt className="info-icon" />
                                                            <div>
                                                                <span className="info-label">{t('appointmentDate').toUpperCase()}</span>
                                                                <span className="info-value">{formatDate(appointment.appointment_date)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="info-item">
                                                            <span className="info-label">{t('description').toUpperCase()}</span>
                                                            <p className="info-description">
                                                                {appointment.description || t('noDescription')}
                                                            </p>
                                                        </div>

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

                                                {/* Botões na mesma linha */}
                                                <div className="appointment-card-footer d-flex gap-2">
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

            {paymentError && (
                <div className="alert alert-warning" role="alert">
                    {paymentError}
                </div>
            )}

            <AppointmentStatusModal
                appointment={selectedAppointment}
                open={!!selectedAppointment}
                onOpenChange={(open: boolean) => !open && setSelectedAppointment(null)}
            />
        </div>
    );
}
