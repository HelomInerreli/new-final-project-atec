import { useState, useEffect } from "react";
import { ClientMenu } from "../../components/ClientMenu";
import { Vehicles } from "../vehicles/vehicles";
import { Appointments } from "../future_appointments/FutureAppointments";
import { PastAppointmentsPage } from "../pastAppointments/PastAppointmentsPage";
import { Invoices } from "../invoices/invoices";
import Profile from "../profile/profile";
import Dashboard from "../dashboard/Dashboard";
import { useAuth } from "../../api/auth";
import { useTranslation } from "react-i18next";
import "../../styles/ClientLayout.css";

export type ClientSection = 
  | "dashboard" 
  | "appointments" 
  | "vehicles" 
  | "service-history" 
  | "invoices" 

export function ClientLayout() {
  const [activeSection, setActiveSection] = useState<ClientSection>("dashboard");
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();

  // Ler parâmetros da URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') as ClientSection;
    
    if (section) {
      setActiveSection(section);
      // Limpar parâmetros da URL após processar
      window.history.replaceState({}, '', '/my-services');
    }
  }, []);

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
        onSectionChange={setActiveSection} 
      />
      <div className="client-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default ClientLayout;
