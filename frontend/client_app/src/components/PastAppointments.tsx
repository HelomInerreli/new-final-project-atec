import { usePastAppointments } from '../hooks/usePastAppointments';
import { useTranslation } from 'react-i18next';
import '../styles/PastAppointments.css';

export function PastAppointments() {
    const { t } = useTranslation();
    const { groupedAppointments, loading, error, isLoggedIn } = usePastAppointments();

    if (!isLoggedIn) {
        return (
            <div className="alert alert-info">
                {t('pleaseLogin')}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
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
        <div className="container">
            <h4 className="mb-4">
                {t('completedServicesHistory')}
            </h4>
            {Object.keys(groupedAppointments).length === 0 ? (
                <p>
                    {t('noServicesFound')}
                </p>
            ) : (
                Object.entries(groupedAppointments).map(([monthYear, appointments]) => (
                    <div key={monthYear} className="mb-4">
                        <h5 className="mb-3">
                            {monthYear}
                        </h5>
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="card mb-3">
                                <div className="card-body">
                                    <h6 className="card-title">
                                        {appointment.service?.name || t('serviceType')}
                                    </h6>
                                    <p className="card-text">
                                        <strong>{t('date')}:</strong> {new Date(appointment.appointment_date).toLocaleDateString('pt-PT')}
                                    </p>
                                    <p className="card-text">
                                        <strong>{t('estimatedBudget')}:</strong> €{appointment.estimated_budget}
                                    </p>
                                    <p className="card-text">
                                        <strong>{t('actualBudget')}:</strong> €{appointment.actual_budget}
                                    </p>
                                    {/* Adicione mais campos se necessário, como extra_services */}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}