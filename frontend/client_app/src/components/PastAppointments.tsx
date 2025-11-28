import { useState } from 'react';
import { usePastAppointments } from '../hooks/usePastAppointments';
import { useTranslation } from 'react-i18next';
import '../styles/PastAppointments.css';

export function PastAppointments() {
    const { t } = useTranslation();
    const { groupedAppointments, loading, error, isLoggedIn } = usePastAppointments();
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

    const toggleMonth = (monthYear: string) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthYear]: !prev[monthYear]
        }));
    };

    if (!isLoggedIn) {
        return (
            <div className="alert alert-info">
                {t('pleaseLogin')}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center past-loading-container">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">{t('loading')}...</span>
                </div>
                <p className="mt-3">{t('loadingServices')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
            </div>
        );
    }

    return (
        <div className="past-appointments-page">
            <div className="past-appointments-header">
                <h1 className="past-appointments-title">
                    {t('completedServicesHistory')}
                </h1>
            </div>

            {Object.keys(groupedAppointments).length === 0 ? (
                <div className="past-empty-state">
                    <div className="past-empty-icon">📋</div>
                    <h3>{t('noServicesFound')}</h3>
                    <p>{t('noCompletedServicesMessage')}</p>
                </div>
            ) : (
                <div className="past-appointments-content">
                    {Object.entries(groupedAppointments).map(([monthYear, appointments]) => (
                        <div key={monthYear} className="past-month-section">
                                                        <div 
                                className="past-month-header"
                                onClick={() => toggleMonth(monthYear)}
                            >
                                <div className="past-month-header-content">
                                    <h2 className="past-month-title">
                                        {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                                    </h2>
                                    <span className="past-appointment-count">
                                        {appointments.length} {appointments.length === 1 ? t('appointment') : t('appointments')}
                                    </span>
                                </div>
                                <span className={`past-toggle-icon ${expandedMonths[monthYear] ? 'past-expanded' : ''}`}>
                                    ❯
                                </span>
                            </div>

                            {expandedMonths[monthYear] && (
                                <div className="past-appointments-list">
                                    {appointments.map((appointment) => (
                                        <div key={appointment.id} className="past-appointment-card">
                                            <div className="past-card-header">
                                                <div className="past-card-title-section">
                                                    <div className="past-service-icon">🔧</div>
                                                    <h3 className="past-service-name">
                                                        {appointment.service?.name || t('serviceType')}
                                                    </h3>
                                                </div>
                                                <span className="past-status-badge">
                                                    {t('completed').toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="past-card-body">
                                                <div className="past-info-row">
                                                    <span className="past-info-icon">📅</span>
                                                    <div className="past-info-content">
                                                        <span className="past-info-label">{t('appointmentDate').toUpperCase()}</span>
                                                        <span className="past-info-value">
                                                            {new Date(appointment.appointment_date).toLocaleDateString('pt-PT', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {appointment.description && (
                                                    <div className="past-info-row">
                                                        <span className="past-info-icon">📝</span>
                                                        <div className="past-info-content">
                                                            <span className="past-info-label">{t('description').toUpperCase()}</span>
                                                            <span className="past-info-value">{appointment.description}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="past-info-row">
                                                    <span className="past-info-icon">💰</span>
                                                    <div className="past-info-content">
                                                        <span className="past-info-label">{t('estimatedBudget').toUpperCase()}</span>
                                                        <span className="past-budget-value">€{appointment.estimated_budget.toFixed(0)}</span>
                                                    </div>
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