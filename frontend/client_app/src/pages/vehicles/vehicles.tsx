import React from "react";
import "../../styles/vehicles.css";

const Vehicles: React.FC = () => {
  return (
    <div className="vehicles-container">
      <h1 className="title">As minhas Viaturas</h1>

      <div className="vehicle-card">
        <div className="vehicle-header">
          <div>
            <h2 className="vehicle-name">AUDI A3 Sportback (8VA,…)</h2>
            <p className="vehicle-plate">78-TJ-90</p>
          </div>
          <span className="status-dot"></span>
        </div>

        <div className="vehicle-options">
          <div className="option">
            <span>Marcações</span> <span className="count">0</span>
          </div>
          <div className="option">
            <span>Simulações Online</span> <span className="count">0</span>
          </div>
          <div className="option disabled">
            <span>Check-ups</span>
          </div>
          <div className="option disabled">
            <span>Orçamentos</span>
          </div>
          <div className="option disabled">
            <span>Faturas</span>
          </div>
        </div>

        <div className="buttons">
          <button className="btn primary">Marcar Serviço</button>
          <button className="btn secondary">Simular Revisão</button>
        </div>
      </div>

      <button className="add-btn">
        <span className="plus">+</span> Acrescentar Viatura
      </button>
    </div>
  );
};

export default Vehicles;
