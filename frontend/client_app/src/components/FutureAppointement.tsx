import { FaCalendarAlt, FaCheckCircle, FaTools } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useFutureAppointments } from '../hooks/useFutureAppointments';
import { formatDate } from '../utils/dateUtils';
import '../styles/FutureAppointments.css';

export function FutureAppointments() {
    const { t } = useTranslation();
    const { groupedAppointments, loading, error } = useFutureAppointments();

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
                    <p>{t('noAppointmentsDescription')}</p>
                </div>
            )}

            {!error && Object.keys(groupedAppointments).length > 0 && (
                <div className="grouped-appointments">
                    {Object.entries(groupedAppointments).map(([monthYear, appointments]) => (
                        <div key={monthYear} className="month-group">
                            <h4 className="month-header">{monthYear}</h4>
                            <div className="appointments-grid">
                                {appointments.map((appointment) => (
                                    <div key={appointment.id} className="appointment-card">
                                        <div className="appointment-card-header">
                                            <div className="appointment-icon">
                                                <FaCheckCircle size={32} />
                                            </div>
                                            <div className="appointment-status">
                                                <span className="status-badge status-completed">
                                                    {t('completed')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="appointment-card-body">
                                            <h3 className="appointment-service">
                                                <FaTools className="me-2" />
                                                {appointment.service?.name || 'Serviço'}
                                            </h3>

                                            <div className="appointment-info">
                                                <div className="info-item">
                                                    <FaCalendarAlt className="info-icon" />
                                                    <div>
                                                        <span className="info-label">{t('appointmentDate')}</span>
                                                        <span className="info-value">{formatDate(appointment.appointment_date)}</span>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <span className="info-label">{t('description')}</span>
                                                    <p className="info-description">
                                                        {appointment.description || t('noDescription')}
                                                    </p>
                                                </div>

                                                {(appointment.estimated_budget || appointment.actual_budget) && (
                                                    <div className="appointment-budget">
                                                        {appointment.estimated_budget && (
                                                            <div className="budget-item">
                                                                <span className="budget-label">{t('estimatedBudget')}</span>
                                                                <span className="budget-value text-muted">€{appointment.estimated_budget.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
