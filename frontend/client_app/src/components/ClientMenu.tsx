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
} from 'react-icons/fa';

export type ClientSection = 
  | "dashboard" 
  | "appointments" 
  | "vehicles" 
  | "schedule" 
  | "service-history" 
  | "invoices" 
  | "profile";

interface ClientMenuProps {
  activeSection: ClientSection;
  onSectionChange: (section: ClientSection) => void;
}

export function ClientMenu({ activeSection, onSectionChange }: ClientMenuProps) {
  const { t } = useTranslation();

  const handleClick = (section: ClientSection) => {
    onSectionChange(section);
  };

  return (
    <div className="modern-sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className={activeSection === "dashboard" ? "active" : ""}>
            <button onClick={() => handleClick("dashboard")}>
              <FaTachometerAlt className="menu-icon" />
              <span>{t("dashboard")}</span>
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

          <li className={activeSection === "schedule" ? "active" : ""}>
            <button onClick={() => handleClick("schedule")}>
              <FaCalendarPlus className="menu-icon" />
              <span>{t("scheduleNewService")}</span>
            </button>
          </li>

          <li className={activeSection === "service-history" ? "active" : ""}>
            <button onClick={() => handleClick("service-history")}>
              <FaCheckCircle className="menu-icon" />
              <span>{t("myServices")}</span>
            </button>
          </li>

          <li className={activeSection === "invoices" ? "active" : ""}>
            <button onClick={() => handleClick("invoices")}>
              <FaFileInvoice className="menu-icon" />
              <span>{t("myInvoices")}</span>
            </button>
          </li>

          <li className={activeSection === "profile" ? "active" : ""}>
            <button onClick={() => handleClick("profile")}>
              <FaUser className="menu-icon" />
              <span>{t("myProfile")}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default ClientMenu;