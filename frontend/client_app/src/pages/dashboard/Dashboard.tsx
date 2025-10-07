import React from "react";
import "../../styles/Dashboard.css";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/DashboardCard.css";
import DashboardCard from "../../components/DashboardCard";


const Dashboard: React.FC = () => {
return (
<div className="dashboard">
  <header className="dashboard-header">
    <div>
      <h1>Dashboard</h1>
        <p className="subtitle">Resumo rápido da sua atividade</p>
    </div>
    <div className="header-actions">
      <button className="btn btn-primary">Verificar resumo</button>
    </div>
    
<br />

    <DashboardCard />

  </header>

</div>
);
};

export default Dashboard;
