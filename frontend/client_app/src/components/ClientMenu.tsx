import React from "react";
import { Link } from "react-router-dom";

const ClientMenu: React.FC = () => (
  <div className="sidemenu-wrapper">
    <nav className="client-menu" aria-label="Menu do cliente">
      <ul>
        <li>
          <h2>Dashboard</h2>
        </li>
        <li>
          <h2>Meus Agendamentos</h2>
        </li>
        <li>
          <h2>Meus Veiculos</h2>
        </li>
        <li>
          <h2>Agendar novo serviço</h2>
        </li>
        <li>
          <h2>Meus serviços realizados</h2>
        </li>
        <li>
          <h2>Minhas Faturas</h2>
        </li>
        <li>
          <h2>Meus dados</h2>
        </li>
        <li>
          <h2>Sair</h2>
        </li>
      </ul>
    </nav>
  </div>
);

export default ClientMenu;

