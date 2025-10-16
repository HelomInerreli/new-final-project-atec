import { Link } from "react-router-dom";
import "../styles/ClientMenu.css";
import "../i18n";
import { useTranslation } from "react-i18next";
import { FaCar, FaCalendarAlt, FaCheckCircle, FaFileInvoice, FaUser, FaSignOutAlt } from 'react-icons/fa';


export function ClientMenu() {

  const { t } = useTranslation();
  return (
  <div>
    

    <section className="content">
      <div className="sidemenu">
        <div className="sidemenu-wrapper">

         

          <br />
          <br />
          <br />
          
          <nav className="client-menu" aria-label="Menu do cliente">
            <ul>
              <li><Link to="/dashboard"><h2> Dashboard</h2></Link></li>
              <hr />
              <li><Link to="/appointments"><h2>{t("appointment")}</h2></Link></li>
              <hr />
              <li><Link to="/vehicles"><h2><FaCar /> Meus Veiculos</h2></Link></li>
              <hr />
              <li><Link to="/schedule"><h2><FaCalendarAlt /> Agendar novo serviço</h2></Link></li>
              <li><Link to="/completed-services"><h2><FaCheckCircle /> Meus serviços realizados</h2></Link></li>
              <li><Link to="/invoices"><h2><FaFileInvoice /> Minhas Faturas</h2></Link></li>
              <li><Link to="/profile"><h2><FaUser /> Meus dados</h2></Link></li>
              <li><Link to="/logout"><h2><FaSignOutAlt /> Sair</h2></Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </div>
);
}

export default ClientMenu;

