import React from "react";
import "../../styles/Dashboard.css";
import { Link } from "react-router-dom";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/DashboardCard.css";
import DashboardCard from "../../components/DashboardCard";


const Dashboard: React.FC = () => {
  return (
    <Container fluid className="dashboard">
      <header className="dashboard-header text-center mb-4">
        <h1>Dashboard</h1>
        <p className="subtitle">Resumo rápido da sua atividade</p>
      </header>

      <Row className="justify-content-center g-4 flex-wrap">
        <Col xs="auto">
          <DashboardCard
            name="Marcações"
            
          />
        </Col>
        <Col xs="auto">
          <DashboardCard
            name="Revisão"
            
          />
        </Col>
        <Col xs="auto">
          <DashboardCard
            name="Pneus"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
