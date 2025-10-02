import React from "react";
import "../../styles/Dashboard.css";

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
  </header>
  
</div>
);
};

export default Dashboard;
