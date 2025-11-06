import { useState } from "react";
import { ClientMenu } from "../../components/ClientMenu";
import { Vehicles } from "../vehicles/vehicles";
import { Appointments } from "../future_appointments/FutureAppointments";
import { PastAppointmentsPage } from "../pastAppointments/PastAppointmentsPage";
import Profile from "../profile/profile";
import Dashboard from "../dashboard/Dashboard";
import { useAuth } from "../../api/auth";
import { useTranslation } from "react-i18next";
import "../../styles/ClientLayout.css";

export type ClientSection = 
  | "dashboard" 
  | "appointments" 
  | "vehicles" 
  | "schedule" 
  | "service-history" 
  | "invoices" 
  | "profile";

export function ClientLayout() {
  const [activeSection, setActiveSection] = useState<ClientSection>("dashboard");
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();

  if (!isLoggedIn) {
    return (
      <div className="client-layout">
        <div className="alert alert-warning m-5">
          {t('vehiclesPage.pleaseLogin')}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "appointments":
        return (
          <Appointments />
        );
      case "vehicles":
        return <Vehicles />;
      case "schedule":
        return (
          <div className="content-section">
            <h2>Agendar Novo Serviço</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        );
      case "service-history":
        return (
          <PastAppointmentsPage />
        );
      case "invoices":
        return (
          <div className="content-section">
            <h2>Minhas Faturas</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        );
      case "profile":
        return <Profile />;
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
