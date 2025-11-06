import { FutureAppointments } from '../../components/FutureAppointement';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../api/auth';
import '../../styles/Appointments.css';

export function Appointments() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return (
            <div className="appointments-page">
                <div className="alert alert-warning">
                    {t('vehiclesPage.pleaseLogin')}
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-page">
            <div className="appointments-header">
                <h1>{t('appointmentsPage.title')}</h1>
            </div>

            <FutureAppointments />
        </div>
    );
}

