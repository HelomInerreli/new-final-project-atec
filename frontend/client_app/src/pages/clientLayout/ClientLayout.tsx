import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClientMenu } from "../../components/ClientMenu";
import { Vehicles } from "../vehicles/vehicles";
import { Appointments } from "../future_appointments/FutureAppointments";
import { PastAppointmentsPage } from "../pastAppointments/PastAppointmentsPage";
import { Invoices } from "../invoices/invoices";
import Dashboard from "../dashboard/Dashboard";
import { useAuth } from "../../api/auth";
import { useTranslation } from "react-i18next";
import { getActiveSectionFromURL } from "../../utils/navigationHelpers";
import "../../styles/ClientLayout.css";

export type ClientSection = 
  | "dashboard" 
  | "appointments" 
  | "vehicles" 
  | "service-history" 
  | "invoices" 

export function ClientLayout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<ClientSection>("dashboard");
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();

  // Sincronizar estado com a URL
  useEffect(() => {
    const sectionFromURL = getActiveSectionFromURL();
    setActiveSection(sectionFromURL);
  }, [searchParams]);

  // Função para mudar de seção e atualizar a URL
  const handleSectionChange = (section: ClientSection) => {
    setActiveSection(section);
    navigate(`/my-services?section=${section}`, { replace: true });
  };

  if (!isLoggedIn) {
    return (
      <div className="client-layout">
        <div className="alert alert-warning m-5">
          {t('pleaseLogin')}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "appointments":
        return <Appointments />;
      case "vehicles":
        return <Vehicles />;
      case "service-history":
        return <PastAppointmentsPage />;
      case "invoices":
        return (
          <Invoices />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="client-layout">
      <ClientMenu 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      <div className="client-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default ClientLayout;
