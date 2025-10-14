import React from "react";
import { Link } from "react-router-dom";
import "../styles/ClientMenu.css";



const ClientMenu: React.FC = () => (
  <div>
    

    <section className="content">
      <div className="sidemenu">
        <div className="sidemenu-wrapper">

          <h1>Menu onde terá o logo</h1>

          <br />
          
          <nav className="client-menu" aria-label="Menu do cliente">
            <ul>
              <li><Link to="/dashboard"><h2> Dashboard</h2></Link></li>
              <li><Link to="/appointments"><h2>Meus Agendamentos</h2></Link></li>
              <li><Link to="/vehicles"><h2>Meus Veiculos</h2></Link></li>
              <li><Link to="/schedule"><h2>Agendar novo serviço</h2></Link></li>
              <li><Link to="/completed-services"><h2>Meus serviços realizados</h2></Link></li>
              <li><Link to="/invoices"><h2>Minhas Faturas</h2></Link></li>
              <li><Link to="/profile"><h2>Meus dados</h2></Link></li>
              <li><Link to="/logout"><h2>Sair</h2></Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </div>
);

export default ClientMenu;

