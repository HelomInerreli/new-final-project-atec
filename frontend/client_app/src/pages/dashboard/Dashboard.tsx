import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardStatCard } from '../../components/DashboardStatCard';
import { 
    formatDateTime, 
    formatNextAppointment, 
    formatVehicleInfo, 
    formatServiceName,
    formatCountDescription 
} from '../../utils/dashboardFormatters';
import { navigateToSection } from '../../utils/navigationHelpers';
import { FaCar, FaCalendarAlt, FaHistory, FaClock } from 'react-icons/fa';
import '../../styles/Dashboard.css';

/**
 * Página principal do Dashboard do cliente
 * Exibe estatísticas resumidas e agendamentos recentes
 */
export function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { stats, loading, error, isLoggedIn } = useDashboard();

    // Verificação de login
    if (!isLoggedIn) {
        return (
            <div className="dashboard-page">
                <div className="alert alert-warning">
                    {t('dashboard.pleaseLogin', { defaultValue: 'Por favor, faça login para ver o dashboard' })}
                </div>
            </div>
        );
    }

    // Estado de carregamento
    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">{t('loading')}</span>
                    </div>
                    <p className="mt-3">{t('dashboard.loading', { defaultValue: 'A carregar dashboard...' })}</p>
                </div>
            </div>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <div className="dashboard-page">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <h1>{t('dashboard.title', { defaultValue: 'Dashboard' })}</h1>
                <p className="dashboard-subtitle">
                    {t('dashboard.subtitle', { defaultValue: 'Resumo rápido da sua atividade' })}
                </p>
            </div>

            {/* Estatísticas em Cards */}
            <div className="dashboard-stats-grid">
                <DashboardStatCard
                    icon={<FaCar size={32} />}
                    title={t('dashboard.vehicles', { defaultValue: 'Veículos Registrados' })}
                    value={stats.totalVehicles}
                    description={formatCountDescription(
                        stats.totalVehicles,
                        t('dashboard.vehicleDescriptionSingular', { defaultValue: 'veículo ativo' }),
                        t('dashboard.vehicleDescriptionPlural', { defaultValue: 'veículos ativos' })
                    )}
                    color="red"
                    onClick={() => navigateToSection('vehicles', navigate)}
                />

                <DashboardStatCard
                    icon={<FaCalendarAlt size={32} />}
                    title={t('dashboard.futureAppointments', { defaultValue: 'Agendamentos Futuros' })}
                    value={stats.futureAppointments}
                    description={formatCountDescription(
                        stats.futureAppointments,
                        t('dashboard.appointmentDescriptionSingular', { defaultValue: 'agendamento pendente' }),
                        t('dashboard.appointmentDescriptionPlural', { defaultValue: 'agendamentos pendentes' })
                    )}
                    color="blue"
                    onClick={() => navigateToSection('appointments', navigate)}
                />

                <DashboardStatCard
                    icon={<FaHistory size={32} />}
                    title={t('dashboard.completedServices', { defaultValue: 'Serviços Realizados' })}
                    value={stats.pastAppointments}
                    description={t('dashboard.completedServicesDescription', { 
                        defaultValue: 'histórico completo' 
                    })}
                    color="green"
                    onClick={() => navigateToSection('service-history', navigate)}
                />

                <DashboardStatCard
                    icon={<FaClock size={32} />}
                    title={t('dashboard.nextAppointment', { defaultValue: 'Próximo Agendamento' })}
                    value={stats.nextAppointment ? '📅' : '—'}
                    description={formatNextAppointment(
                        stats.nextAppointment,
                        t('dashboard.noUpcomingAppointments', { defaultValue: 'Nenhum agendamento' })
                    )}
                    color="orange"
                />
            </div>

            {/* Agendamentos Recentes */}
            {stats.recentAppointments.length > 0 && (
                <div className="dashboard-recent-section">
                    <h2 className="section-title">
                        {t('dashboard.recentActivity', { defaultValue: 'Atividade Recente' })}
                    </h2>
                    
                    <div className="recent-appointments-table-wrapper">
                        <table className="recent-appointments-table">
                            <thead>
                                <tr>
                                    <th>{t('dashboard.table.date', { defaultValue: 'Data' })}</th>
                                    <th>{t('dashboard.table.vehicle', { defaultValue: 'Veículo' })}</th>
                                    <th>{t('dashboard.table.services', { defaultValue: 'Serviços' })}</th>
                                    <th>{t('dashboard.table.status', { defaultValue: 'Estado' })}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td data-label={t('dashboard.table.date', { defaultValue: 'Data' })}>
                                            {formatDateTime(appointment.appointment_date)}
                                        </td>
                                        <td data-label={t('dashboard.table.vehicle', { defaultValue: 'Veículo' })}>
                                            {formatVehicleInfo(appointment.vehicle)}
                                        </td>
                                        <td data-label={t('dashboard.table.services', { defaultValue: 'Serviços' })}>
                                            {formatServiceName(appointment.service)}
                                        </td>
                                        <td data-label={t('dashboard.table.status', { defaultValue: 'Estado' })}>
                                            <span className="status-badge status-completed">
                                                {t('dashboard.status.completed', { defaultValue: 'Concluído' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mensagem quando não há agendamentos recentes */}
            {stats.recentAppointments.length === 0 && (
                <div className="no-recent-activity">
                    <FaHistory size={48} color="#ccc" />
                    <h3>{t('dashboard.noRecentActivity', { defaultValue: 'Sem atividade recente' })}</h3>
                    <p>
                        {t('dashboard.noRecentActivityMessage', { 
                            defaultValue: 'Você ainda não tem serviços concluídos. Agende seu primeiro serviço!' 
                        })}
                    </p>
                    <button 
                        className="btn btn-danger"
                        onClick={() => navigateToSection('appointments', navigate)}
                    >
                        {t('dashboard.scheduleService', { defaultValue: 'Agendar Serviço' })}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
