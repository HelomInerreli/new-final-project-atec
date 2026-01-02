import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePastAppointments } from '../../hooks/usePastAppointments';
import { InvoiceDetail } from '../../components/InvoiceDetail';
import '../../styles/PastAppointments.css';
import '../../styles/invoiceDetail.css';

/**
 * Componente de página para gestão de faturas de agendamentos concluídos
 * Exibe lista de faturas agrupadas por mês com visualização expandível
 * Permite visualização detalhada de cada fatura individualmente
 * Suporta seleção de fatura via URL (parâmetro appointment)
 * Requer autenticação - exibe alerta se utilizador não autenticado
 * @returns Componente JSX da página de faturas
 */
export function Invoices() {
    /**
     * Hook de tradução para internacionalização
     */
    const { t } = useTranslation();
    
    /**
     * Hook para obter agendamentos concluídos agrupados por mês
     * Fornece dados de agendamentos, estados de loading/error e autenticação
     */
    const { groupedAppointments, loading, error, isLoggedIn } = usePastAppointments();
    
    /**
     * Estado para armazenar ID do agendamento selecionado para visualização de fatura
     * Tipo: number | null
     * Inicial: null (nenhuma fatura selecionada)
     */
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    
    /**
     * Estado para controlar quais meses estão expandidos na lista
     * Tipo: Record<string, boolean> (chave: mês-ano, valor: expandido)
     * Inicial: {} (todos os meses colapsados)
     */
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

    /**
     * Efeito para detectar appointment_id da URL ao carregar a página
     * Extrai parâmetro 'appointment' da query string e seleciona fatura automaticamente
     * Executado apenas na montagem do componente
     */
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const appointmentParam = urlParams.get('appointment');
        
        if (appointmentParam) {
            const appointmentId = parseInt(appointmentParam, 10);
            if (!isNaN(appointmentId)) {
                setSelectedAppointmentId(appointmentId);
            }
        }
    }, []);

    /**
     * Handler para visualizar detalhes de uma fatura específica
     * @param appointmentId - ID do agendamento cuja fatura será visualizada
     */
    const handleViewInvoice = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
    };

    /**
     * Handler para voltar à lista de faturas
     * Remove seleção de fatura e exibe lista agrupada por mês
     */
    const handleBackToList = () => {
        setSelectedAppointmentId(null);
    };

    /**
     * Handler para alternar expansão/colapso de um mês específico
     * @param monthYear - Identificador do mês-ano a ser alternado
     */
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
                <p className="mt-3">{t('invoices.loading')}</p>
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

    if (selectedAppointmentId) {
        return (
            <div className="past-appointments-page">
                <button 
                    className="btn btn-secondary mb-4"
                    onClick={handleBackToList}
                    style={{ 
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                >
                    ← {t('invoices.backButton')}
                </button>
                <InvoiceDetail appointmentId={selectedAppointmentId} />
            </div>
        );
    }

    return (
        <div className="past-appointments-page">
            <div className="past-appointments-header">
                <h1 className="past-appointments-title">
                    {t('invoices.title')}
                </h1>
            </div>

            {Object.keys(groupedAppointments).length === 0 ? (
                <div className="past-empty-state">
                    <div className="past-empty-icon">📄</div>
                    <h3>{t('invoices.noInvoicesFound')}</h3>
                    <p>{t('invoices.noInvoicesMessage')}</p>
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
                                    <h2 className="past-month-title">{monthYear}</h2>
                                    <span className="past-appointment-count">
                                        {appointments.length} {appointments.length === 1 ? t('invoices.invoice_singular') : t('invoices.invoice_plural')}
                                    </span>
                                </div>
                                <span className={`past-toggle-icon ${expandedMonths[monthYear] ? 'past-expanded' : ''}`}>
                                    ❯
                                </span>
                            </div>

                            {expandedMonths[monthYear] && (
                                <div className="past-appointments-list">
                                    {appointments.map((appointment) => (
                                        <div key={appointment.id} className="card mb-3">
                                            <div className="card-body">
                                                <h5 className="card-title">{appointment.service?.name || t('service')}</h5>
                                                <p className="card-text">
                                                    {appointment.date && new Date(appointment.date).toLocaleDateString()}
                                                </p>
                                                <button 
                                                    className="btn btn-danger w-100"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleViewInvoice(appointment.id);
                                                    }}
                                                    style={{
                                                        background: '#dc3545',
                                                        border: 'none',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#c82333';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#dc3545';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                    📄 {t('invoices.viewInvoice')}
                                                </button>
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
