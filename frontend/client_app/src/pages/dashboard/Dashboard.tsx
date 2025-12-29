import React, { useMemo } from "react";
import "../../styles/Dashboard.css";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Componente de dashboard principal do cliente
 * Exibe resumo de atividade com KPIs e histórico recente
 * Inclui: marcações do dia, revisões pendentes, pneus a substituir, última fatura
 * Mostra tabela de atividade recente com marcações, faturas e revisões
 * Nota: Atualmente usa dados mockados - em produção conectar a API
 * @returns Componente JSX do dashboard
 */
const Dashboard: React.FC = () => {
  /**
   * Objeto com estatísticas do dashboard (dados mockados para demonstração)
   * Em produção, estes dados viriam de uma API
   */
  const stats = {
    appointmentsToday: 2,
    nextAppointment: "2025-10-14T10:00:00",
    pendingReviews: 1,
    tiresToReplace: 2,
    lastInvoice: 320.5,
  };

  /**
   * Formata a data da próxima marcação para formato português (pt-PT)
   * Memorizado para evitar recálculos desnecessários
   */
  const nextApptText = useMemo(() => {
    const d = new Date(stats.nextAppointment);
    return d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  }, [stats.nextAppointment]);

  /**
   * Formatador de valores monetários para formato português (€)
   * Memorizado para evitar recriações desnecessárias
   */
  const currency = useMemo(
    () => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }),
    []
  );

  return (
    <Container fluid className="dashboard">
      {/* Cabeçalho do dashboard */}
      <header className="dashboard-header text-center mb-4">
        <h1>Dashboard</h1>
        <p className="subtitle">Resumo rápido da sua atividade</p>
      </header>
      {/* Grid de KPIs com indicadores principais */}
      <Row className="justify-content-center g-4 kpi-grid">
        {/* Card: Marcações do dia */}
        <Col xs={12} sm={6} lg={3}>
          <div className="dashboard-card">
            <div className="icon-badge" aria-hidden>📅</div>
            <div className="card-text">
              <div className="dashboard-card-title">Marcações hoje</div>
              <div className="dashboard-card-value">{stats.appointmentsToday}</div>
              <div className="dashboard-card-desc">Próxima: {nextApptText}</div>
            </div>
          </div>
        </Col>
        {/* Card: Revisões pendentes */}
        <Col xs={12} sm={6} lg={3}>
          <div className="dashboard-card">
            <div className="icon-badge" aria-hidden>🛠️</div>
            <div className="card-text">
              <div className="dashboard-card-title">Revisões pendentes</div>
              <div className="dashboard-card-value">{stats.pendingReviews}</div>
              <div className="dashboard-card-desc">Acompanhe o estado</div>
            </div>
          </div>
        </Col>
        {/* Card: Pneus a substituir */}
        <Col xs={12} sm={6} lg={3}>
          <div className="dashboard-card">
            <div className="icon-badge" aria-hidden>🛞</div>
            <div className="card-text">
              <div className="dashboard-card-title">Pneus a substituir</div>
              <div className="dashboard-card-value">{stats.tiresToReplace}</div>
              <div className="dashboard-card-desc">Ver recomendações</div>
            </div>
          </div>
        </Col>
        {/* Card: Última fatura */}
        <Col xs={12} sm={6} lg={3}>
          <div className="dashboard-card">
            <div className="icon-badge" aria-hidden>💳</div>
            <div className="card-text">
              <div className="dashboard-card-title">Última fatura</div>
              <div className="dashboard-card-value">
                {currency.format(stats.lastInvoice)}
              </div>
              <div className="dashboard-card-desc">Histórico disponível</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Seção de atividade recente com tabela de marcações, faturas e revisões */}
      <Row className="justify-content-center mt-4 w-100">
        <Col xs={12} md={10} lg={8}>
          <section className="recent-card">
            <div className="recent-header">
              <span>Atividade recente</span>
            </div>
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th className="right">Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Tipo">Marcação</td>
                  <td data-label="Descrição">Alinhamento e Mudança de Óleo</td>
                  <td data-label="Data">{new Date("2025-10-12T16:30:00").toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="right" data-label="Valor">—</td>
                  <td data-label="Estado"><span className="chip ok">Concluído</span></td>
                </tr>
                <tr>
                  <td data-label="Tipo">Fatura</td>
                  <td data-label="Descrição">FT-2025-010</td>
                  <td data-label="Data">{new Date("2025-10-12T17:00:00").toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="right" data-label="Valor">{currency.format(122.35)}</td>
                  <td data-label="Estado"><span className="chip ok">Paga</span></td>
                </tr>
                <tr>
                  <td data-label="Tipo">Revisão</td>
                  <td data-label="Descrição">Revisão Periódica</td>
                  <td data-label="Data">{new Date("2025-10-10T10:00:00").toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="right" data-label="Valor">—</td>
                  <td data-label="Estado"><span className="chip warn">Agendada</span></td>
                </tr>
              </tbody>
            </table>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
