import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClientMenu } from "../../components/ClientMenu";
import { Vehicles } from "../vehicles/vehicles";
import { Appointments } from "../future_appointments/FutureAppointments";
import { PastAppointmentsPage } from "../pastAppointments/PastAppointmentsPage";
import { Invoices } from "../invoices/invoices";
import Dashboard from "../dashboard/Dashboard";
import { useAuth, handleTokenExpiration, getStoredToken, isTokenValid } from "../../api/auth";
import { useTranslation } from "react-i18next";
import { getActiveSectionFromURL } from "../../utils/navigationHelpers";
import "../../styles/ClientLayout.css";

/**
 * Tipo para as seções disponíveis na área do cliente
 * Define as páginas navegáveis: dashboard, agendamentos, veículos, histórico e faturas
 */
export type ClientSection =
  | "dashboard"
  | "appointments"
  | "vehicles"
  | "service-history"
  | "invoices";

/**
 * Layout principal da área do cliente
 * Componente container com navegação lateral e renderização dinâmica de conteúdo
 * Suporta navegação via parâmetros URL (parâmetro 'section')
 * Requer autenticação - exibe alerta se utilizador não autenticado
 * @returns Componente JSX do layout do cliente
 */
export function ClientLayout() {
  /**
   * Estado para controlar a seção ativa exibida
   * Tipo: ClientSection
   * Inicial: "dashboard"
   */
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] =
    useState<ClientSection>("dashboard");

  /**
   * Hook de autenticação para verificar estado de login do utilizador
   */
  const { isLoggedIn } = useAuth();

  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Efeito para processar parâmetros URL ao carregar a página
   * Lê parâmetro 'section' da query string e define seção ativa
   * Limpa URL após processar para evitar persistência de parâmetros
   * Executa uma única vez no mount do componente
   */
  // Sincronizar estado com a URL
  useEffect(() => {
    const sectionFromURL = getActiveSectionFromURL();
    setActiveSection(sectionFromURL);
  }, [searchParams]);

  // Função para mudar de seção e atualizar a URL
  const handleSectionChange = (section: ClientSection) => {
    // Verifica se está logado e se o token ainda é válido
    const token = getStoredToken();
    if (!token || !isTokenValid(token)) {
      handleTokenExpiration(navigate);
      return;
    }
    setActiveSection(section);
    navigate(`/my-services?section=${section}`, { replace: true });
  };

  /**
   * Retorna alerta se utilizador não estiver autenticado
   */
  if (!isLoggedIn) {
    return (
      <div className="client-layout">
        <div className="alert alert-warning m-5">{t("pleaseLogin")}</div>
      </div>
    );
  }

  /**
   * Renderiza o componente de conteúdo baseado na seção ativa
   * Switch case para mapear ClientSection ao componente correspondente
   * @returns Componente JSX da seção selecionada
   */
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
        return <Invoices />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="client-layout">
      {/* Menu lateral de navegação do cliente */}
      <ClientMenu
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      {/* Área de conteúdo dinâmico */}
      <div className="client-content">{renderContent()}</div>
    </div>
  );
}

export default ClientLayout;
