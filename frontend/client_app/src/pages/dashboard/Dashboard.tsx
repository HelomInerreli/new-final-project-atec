import React, { useMemo } from "react";
import "../../styles/Dashboard.css";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard: React.FC = () => {
  // Exemplo (substitui pela tua fonte de dados quando quiseres)
  const stats = {
    appointmentsToday: 2,
    nextAppointment: "2025-10-14T10:00:00",
    pendingReviews: 1,
    tiresToReplace: 2,
    lastInvoice: 320.5,
  };

  const nextApptText = useMemo(() => {
    const d = new Date(stats.nextAppointment);
    return d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  }, [stats.nextAppointment]);

  const currency = useMemo(
    () => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }),
    []
  );

  return (
    <Container fluid className="dashboard">
      <header className="dashboard-header text-center mb-4">
        <h1>Dashboard</h1>
        <p className="subtitle">Resumo rápido da sua atividade</p>
      </header>
      {/* KPIs (apenas visual, sem ação) */}
      <Row className="justify-content-center g-4 kpi-grid">
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

      {/* Caixa simples de “atividade recente” (opcional) */}
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
