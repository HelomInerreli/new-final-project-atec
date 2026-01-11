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
} from "react-icons/fa";

// Tipo para as seções do menu do cliente
export type ClientSection =
  | "dashboard"
  | "appointments"
  | "vehicles"
  | "service-history"
  | "invoices";

// Interface para as propriedades do componente ClientMenu
interface ClientMenuProps {
  activeSection: ClientSection;
  onSectionChange: (section: ClientSection) => void;
}

// Componente do menu lateral do cliente
export function ClientMenu({
  activeSection,
  onSectionChange,
}: ClientMenuProps) {
  const { t } = useTranslation();

  // Função para lidar com clique em uma seção do menu
  const handleClick = (section: ClientSection) => {
    onSectionChange(section);
  };

  // Renderiza o menu lateral
  return (
    <div className="modern-sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className={activeSection === "dashboard" ? "active" : ""}>
            <button onClick={() => handleClick("dashboard")}>
              <FaTachometerAlt className="menu-icon" />
              <span>{t("dashboard.title")}</span>
            </button>
          </li>

          <li className={activeSection === "appointments" ? "active" : ""}>
            <button onClick={() => handleClick("appointments")}>
              <FaCalendarAlt className="menu-icon" />
              <span>{t("myAppointments")}</span>
            </button>
          </li>

          <li className={activeSection === "vehicles" ? "active" : ""}>
            <button onClick={() => handleClick("vehicles")}>
              <FaCar className="menu-icon" />
              <span>{t("vehiclesPage.title")}</span>
            </button>
          </li>

          <li className={activeSection === "service-history" ? "active" : ""}>
            <button onClick={() => handleClick("service-history")}>
              <FaCheckCircle className="menu-icon" />
              <span>{t("myServices")}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default ClientMenu;
