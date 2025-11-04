import { Link, useLocation } from "react-router-dom";
import "../styles/ClientMenu.css";
import "../i18n";
import { useTranslation } from "react-i18next";
import { 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaCar, 
  FaCalendarPlus, 
  FaCheckCircle, 
  FaFileInvoice, 
  FaUser, 
  FaSignOutAlt 
} from 'react-icons/fa';

export function ClientMenu() {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="modern-sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className={isActive("/dashboard") ? "active" : ""}>
            <Link to="/dashboard">
              <FaTachometerAlt className="menu-icon" />
              <span>Dashboard</span>
            </Link>
          </li>

          <li className={isActive("/appointments") ? "active" : ""}>
            <Link to="/appointments">
              <FaCalendarAlt className="menu-icon" />
              <span>{t("appointment")}</span>
            </Link>
          </li>

          <li className={isActive("/vehicles") ? "active" : ""}>
            <Link to="/vehicles">
              <FaCar className="menu-icon" />
              <span>Meus Veículos</span>
            </Link>
          </li>

          <li className={isActive("/schedule") ? "active" : ""}>
            <Link to="/schedule">
              <FaCalendarPlus className="menu-icon" />
              <span>Agendar novo serviço</span>
            </Link>
          </li>

          <li className={isActive("/service-history") ? "active" : ""}>
            <Link to="/service-history">
              <FaCheckCircle className="menu-icon" />
              <span>Meus serviços realizados</span>
            </Link>
          </li>

          <li className={isActive("/invoices") ? "active" : ""}>
            <Link to="/invoices">
              <FaFileInvoice className="menu-icon" />
              <span>Minhas Faturas</span>
            </Link>
          </li>

          <li className={isActive("/profile") ? "active" : ""}>
            <Link to="/profile">
              <FaUser className="menu-icon" />
              <span>Meus dados</span>
            </Link>
          </li>

          
        </ul>
      </nav>
    </div>
  );
}

export default ClientMenu;