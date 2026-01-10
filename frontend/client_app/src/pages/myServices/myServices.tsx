import { useState, useEffect } from "react";
import { useAuth } from "../../api/auth";
import { useTranslation } from "react-i18next";
import "../../styles/MyServices.css";

/**
 * MyServices Component
 *
 * Dashboard principal para clientes visualizarem e gerenciarem:
 * - Veículos cadastrados
 * - Agendamentos (pendentes e confirmados)
 * - Histórico de serviços realizados
 *
 * Protegido por autenticação - requer login
 */
export function MyServices() {
    const { t } = useTranslation(); // Hook para tradução i18n
    const { loggedInCustomerId, isLoggedIn } = useAuth(); // Contexto de autenticação
    const [loading, setLoading] = useState(true); // Estado de carregamento inicial

    /**
     * Effect: Gerencia estado de carregamento baseado na autenticação
     * Executa quando o status de login ou ID do cliente muda
     */
    useEffect(() => {
        if (isLoggedIn && loggedInCustomerId) {
            setLoading(false); // Cliente autenticado, para carregamento
        } else {
            setLoading(false); // Não autenticado, mostra mensagem de login
        }
    }, [isLoggedIn, loggedInCustomerId]);

    /**
     * Guard: Verifica se usuário está logado
     * Redireciona ou mostra mensagem se não autenticado
     */
    if (!isLoggedIn) {
        return (
            <div className="my-services-page">
                <div className="alert alert-warning">
                    {t('vehiclesPage.pleaseLogin')}
                </div>
            </div>
        );
    }

    /**
     * Loading State: Mostra spinner enquanto carrega dados
     */
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

    /**
     * Main Render: Dashboard com cards informativos
     * Cada card representa uma seção diferente do sistema
     */
    return (
        <div className="my-services-page">
            <div className="my-services-content">
                <div className="container mt-5 pt-5">
                    {/* Cabeçalho da página */}
                    <h1 className="mb-4">
                        <i className="bi bi-tools me-2"></i>
                        {t("myServices")}
                    </h1>

                    {/* Descrição */}
                    <div className="row">
                        <div className="col-12">
                            <p className="text-muted">
                                Gerencie seus veículos, agendamentos e serviços realizados em um só lugar.
                            </p>
                        </div>
                    </div>

                    {/* Grid de Cards - 3 colunas responsivas */}
                    <div className="row mt-4">
                        {/* Card: Meus Veículos */}
                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <i className="bi bi-car-front display-4 text-primary mb-3"></i>
                                    <h5 className="card-title">Meus Veículos</h5>
                                    <p className="card-text">
                                        Visualize e gerencie seus veículos cadastrados.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card: Agendamentos */}
                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <i className="bi bi-calendar-check display-4 text-success mb-3"></i>
                                    <h5 className="card-title">Agendamentos</h5>
                                    <p className="card-text">
                                        Acompanhe seus agendamentos pendentes e confirmados.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card: Histórico de Serviços */}
                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <i className="bi bi-clipboard-check display-4 text-info mb-3"></i>
                                    <h5 className="card-title">Histórico</h5>
                                    <p className="card-text">
                                        Veja o histórico de todos os serviços realizados.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyServices;