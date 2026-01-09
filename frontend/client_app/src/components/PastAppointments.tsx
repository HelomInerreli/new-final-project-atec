import { useState, useEffect } from "react";
import { usePastAppointments } from "../hooks/usePastAppointments";
import { useTranslation } from "react-i18next";
import { InvoiceDetail } from "./InvoiceDetail";
import "../styles/PastAppointments.css";
import { getCostBreakdown } from "../services/costBreakdownService";

/**
 * Componente para exibir histórico de agendamentos finalizados
 * Mostra agendamentos concluídos agrupados por mês com informações detalhadas
 * Permite expandir/colapsar meses para visualizar os serviços realizados
 * @returns Componente JSX da página de agendamentos passados
 */
export function PastAppointments() {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Hook customizado que retorna agendamentos passados agrupados por mês
   * Inclui estado de autenticação, loading e erros
   */
  const { groupedAppointments, loading, error, isLoggedIn } =
    usePastAppointments();

  /**
   * Estado para controlar quais meses estão expandidos
   * Tipo: Record de string (chave: monthYear) para boolean (expandido ou não)
   * Inicial: objeto vazio (todos os meses colapsados)
   */
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  /**
   * Estado para armazenar os totais reais de cada appointment
   */
  const [realTotals, setRealTotals] = useState<Record<number, number>>({});

  /**
   * Busca os valores reais pagos de todos os appointments quando são carregados
   */
  useEffect(() => {
    const fetchRealTotals = async () => {
      const totals: Record<number, number> = {};
      
      for (const [, appointments] of Object.entries(groupedAppointments)) {
        for (const appointment of appointments) {
          try {
            const breakdown = await getCostBreakdown(appointment.id);
            totals[appointment.id] = breakdown.total;
          } catch (error) {
            console.error(`Erro ao buscar total do appointment ${appointment.id}:`, error);
            // Em caso de erro, usa actual_budget ou estimated_budget como fallback
            totals[appointment.id] = appointment.actual_budget || appointment.estimated_budget;
          }
        }
      }
      
      setRealTotals(totals);
    };

    if (Object.keys(groupedAppointments).length > 0) {
      fetchRealTotals();
    }
  }, [groupedAppointments]);

  /**
   * Alterna o estado de expansão de um determinado mês
   * @param monthYear - Identificador do mês no formato "mês ano" (ex: "janeiro 2025")
   */
  const toggleMonth = (monthYear: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthYear]: !prev[monthYear],
    }));
  };

  /**
   * Retorna alerta se o utilizador não estiver autenticado
   */
  const handleViewInvoice = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
  };

  const handleBackToList = () => {
    setSelectedAppointmentId(null);
  };

  if (!isLoggedIn) {
    return <div className="alert alert-info">{t("pleaseLogin")}</div>;
  }

  /**
   * Exibe indicador de carregamento enquanto os dados são obtidos
   */
  if (loading) {
    return (
      <div className="text-center past-loading-container">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">{t("loading")}...</span>
        </div>
        <p className="mt-3">{t("loadingServices")}</p>
      </div>
    );
  }

  /**
   * Exibe mensagem de erro se houver falha ao carregar os dados
   */
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Se selecionou uma fatura, mostra o detalhe
  if (selectedAppointmentId) {
    return (
      <div className="past-appointments-page">
        <button
          className="btn btn-secondary mb-4"
          onClick={handleBackToList}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#5a6268")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#6c757d")}
        >
          ← {t("back")}
        </button>
        <InvoiceDetail appointmentId={selectedAppointmentId} />
      </div>
    );
  }

  return (
    <div className="past-appointments-page">
      {/* Cabeçalho da página */}
      <div className="past-appointments-header">
        <h1 className="past-appointments-title">
          {t("completedServicesHistory")}
        </h1>
      </div>

      {/* Estado vazio quando não há agendamentos finalizados */}
      {Object.keys(groupedAppointments).length === 0 ? (
        <div className="past-empty-state">
          <div className="past-empty-icon">📋</div>
          <h3>{t("noServicesFound")}</h3>
          <p>{t("noCompletedServicesMessage")}</p>
        </div>
      ) : (
        <div className="past-appointments-content">
          {Object.entries(groupedAppointments).map(
            ([monthYear, appointments]) => (
              <div key={monthYear} className="past-month-section">
                {/* Cabeçalho do mês com contador e botão de expandir */}
                <div
                  className="past-month-header"
                  onClick={() => toggleMonth(monthYear)}
                >
                  <div className="past-month-header-content">
                    <h2 className="past-month-title">
                      {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                    </h2>
                    <span className="past-appointment-count">
                      {appointments.length}{" "}
                      {appointments.length === 1
                        ? t("appointment")
                        : t("appointments")}
                    </span>
                  </div>
                  <span
                    className={`past-toggle-icon ${
                      expandedMonths[monthYear] ? "past-expanded" : ""
                    }`}
                  >
                    ❯
                  </span>
                </div>

                {/* Lista de agendamentos do mês (exibida apenas se expandido) */}
                {expandedMonths[monthYear] && (
                  <div className="past-appointments-list">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="past-appointment-card"
                      >
                        {/* Cabeçalho do card com nome do serviço e badge de status */}
                        <div className="past-card-header">
                          <div className="past-card-title-section">
                            <div className="past-service-icon">🔧</div>
                            <h3 className="past-service-name">
                              {appointment.service?.name || t("serviceType")}
                            </h3>
                          </div>
                          <span className="past-status-badge">
                            {t("completed").toUpperCase()}
                          </span>
                        </div>

                        {/* Corpo do card com informações detalhadas */}
                        <div className="past-card-body">
                          {/* Data do agendamento */}
                          <div className="past-info-row">
                            <span className="past-info-icon">📅</span>
                            <div className="past-info-content">
                              <span className="past-info-label">
                                {t("appointmentDate").toUpperCase()}
                              </span>
                              <span className="past-info-value">
                                {new Date(
                                  appointment.appointment_date
                                ).toLocaleDateString("pt-PT", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Descrição do serviço (condicional) */}
                          {appointment.description && (
                            <div className="past-info-row">
                              <span className="past-info-icon">📝</span>
                              <div className="past-info-content">
                                <span className="past-info-label">
                                  {t("description").toUpperCase()}
                                </span>
                                <span className="past-info-value">
                                  {appointment.description}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Valor pago */}
                          <div className="past-info-row">
                            <span className="past-info-icon">💰</span>
                            <div className="past-info-content">
                              <span className="past-info-label">
                                VALOR PAGO
                              </span>
                              <span className="past-budget-value">
                                €{realTotals[appointment.id]?.toFixed(2) || (appointment.actual_budget || appointment.estimated_budget).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="past-card-footer">
                          <button
                            className="btn-view-invoice"
                            onClick={() => handleViewInvoice(appointment.id)}
                            style={{
                              width: "100%",
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "0.75rem 1.5rem",
                              borderRadius: "8px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "background 0.2s ease",
                              marginTop: "1rem",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#c82333")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#dc3545")
                            }
                          >
                            📄 {t("invoices.viewInvoice")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
