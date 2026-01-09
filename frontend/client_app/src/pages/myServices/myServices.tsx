import { useState, useEffect } from "react";
import { useAuth } from "../../api/auth";
import { useTranslation } from "react-i18next";
import "../../styles/MyServices.css";
import PaymentSuccessModal from '../../components/PaymentSuccessModal';
import PaymentCancelledModal from '../../components/PaymentCancelledModal';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import '../../styles/paymentModal.css';

/**
 * Componente de página para dashboard de serviços do cliente
 * Apresenta visão geral dos serviços disponíveis (veículos, agendamentos, histórico)
 * Exibe cards informativos para navegação entre diferentes funcionalidades
 * Requer autenticação - exibe alerta se utilizador não autenticado
 * @returns Componente JSX da página My Services
 */
export function MyServices() {
    /**
     * Hook de tradução para internacionalização
     */
    const { t } = useTranslation();
    
    /**
     * Hook de autenticação para obter informações do cliente autenticado
     * Fornece ID do cliente e estado de autenticação
     */
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    
    /**
     * Estado para controlar loading inicial da página
     * Tipo: boolean
     * Inicial: true (exibe spinner durante verificação de autenticação)
     */
    const [loading, setLoading] = useState(true);
    const { showSuccess, showCancelled, appointmentId, invoiceNumber, clearStatus } = usePaymentStatus();

    /**
     * Efeito para controlar estado de loading após verificação de autenticação
     * Remove loading quando autenticação é verificada (independente do resultado)
     * Executado quando isLoggedIn ou loggedInCustomerId mudam
     */
    useEffect(() => {
        // Simular carregamento inicial (como no vehicles)
        if (isLoggedIn && loggedInCustomerId) {
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, loggedInCustomerId]);

    // Mesmo padrão de verificação do vehicles.tsx
    if (!isLoggedIn) {
        return (
            <div className="my-services-page">
                <div className="alert alert-warning">
                    {t('vehiclesPage.pleaseLogin')}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="my-services-page">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('loading')}</span>
                    </div>
                    <p className="mt-3">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-services-page">
            <div className="my-services-content">
                <div className="container mt-5 pt-5">
                    <h1 className="mb-4">
                        <i className="bi bi-tools me-2"></i>
                        {t("myServices")}
                    </h1>

                    <div className="row">
                        <div className="col-12">
                            <p className="text-muted">
                                Gerencie seus veículos, agendamentos e serviços realizados em um só lugar.
                            </p>
                        </div>
                    </div>

                    {/* Aqui você pode adicionar cards, tabs ou outras seções */}
                    <div className="row mt-4">
                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <i className="bi bi-car-front display-4 text-primary mb-3"></i>
                                    <h5 className="card-title">Meus Veículos</h5>
                                    <p className="card-text">Visualize e gerencie seus veículos cadastrados.</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <i className="bi bi-calendar-check display-4 text-success mb-3"></i>
                                    <h5 className="card-title">Agendamentos</h5>
                                    <p className="card-text">Acompanhe seus agendamentos pendentes e confirmados.</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <i className="bi bi-clipboard-check display-4 text-info mb-3"></i>
                                    <h5 className="card-title">Histórico</h5>
                                    <p className="card-text">Veja o histórico de todos os serviços realizados.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentSuccessModal
                isOpen={showSuccess}
                onClose={clearStatus}
                appointmentId={appointmentId || 0}
                invoiceNumber={invoiceNumber || undefined}
            />
            
            <PaymentCancelledModal
                isOpen={showCancelled}
                onClose={clearStatus}
            />
        </div>
    );
}

export default MyServices;