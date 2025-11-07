import { useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaTools } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useFutureAppointments } from '../hooks/useFutureAppointments';
import { formatDate } from '../utils/dateUtils';
import '../styles/FutureAppointments.css';

export function FutureAppointments() {
    const { t } = useTranslation();
    const { groupedAppointments, loading, error } = useFutureAppointments();
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

    const toggleMonth = (monthYear: string) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthYear]: !prev[monthYear]
        }));
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
                                    {appointments.map((appointment) => (
                                        <div key={appointment.id} className="appointment-card">
                                            <div className="appointment-card-header">
                                                <div className="appointment-icon">
                                                    <FaCheckCircle size={32} />
                                                </div>
                                                <div className="appointment-status">
                                                    <span className="status-badge status-completed">
                                                        {t('scheduled').toUpperCase()}
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
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
