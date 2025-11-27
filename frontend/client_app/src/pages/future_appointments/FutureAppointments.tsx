import { FutureAppointments } from '../../components/FutureAppointement';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../api/auth';
import { useState } from 'react';
import { NewCreateAppModal } from '../../components/NewCreateAppModal';
import '../../styles/Appointments.css';

export function Appointments() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);

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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">{t('appointmentsPage.title')}</h1>
                <button 
                    className="btn btn-danger"
                    onClick={() => setShowCreateModal(true)}
                >
                    {t('createAppointment', { defaultValue: 'Criar Agendamento' })}
                </button>
            </div>

            <FutureAppointments />

            <NewCreateAppModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
}

