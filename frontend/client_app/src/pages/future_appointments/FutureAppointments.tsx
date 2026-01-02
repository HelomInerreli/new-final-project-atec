import { FutureAppointments } from '../../components/FutureAppointement';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../api/auth';
import { useState } from 'react';
import { NewCreateAppModal } from '../../components/NewCreateAppModal';
import '../../styles/Appointments.css';

/**
 * Componente de página para gestão de agendamentos futuros
 * Exibe lista de agendamentos pendentes e aguardando pagamento
 * Permite criação de novos agendamentos através de modal
 * Requer autenticação - exibe alerta se utilizador não autenticado
 * @returns Componente JSX da página de agendamentos futuros
 */
export function Appointments() {
    /**
     * Hook de tradução para internacionalização
     */
    const { t } = useTranslation();
    
    /**
     * Hook de autenticação para verificar estado de login
     */
    const { isLoggedIn } = useAuth();
    
    /**
     * Estado para controlar visibilidade do modal de criação de agendamento
     * Tipo: boolean
     * Inicial: false
     */
    const [showCreateModal, setShowCreateModal] = useState(false);

    /**
     * Retorna alerta se utilizador não estiver autenticado
     */
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
            {/* Cabeçalho da página com título e botão de criar agendamento */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">{t('appointmentsPage.title')}</h1>
                <button 
                    className="btn btn-danger"
                    onClick={() => setShowCreateModal(true)}
                >
                    {t('createAppointment', { defaultValue: 'Criar Agendamento' })}
                </button>
            </div>

            {/* Componente com lista de agendamentos futuros */}
            <FutureAppointments />

            {/* Modal para criar novo agendamento */}
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

