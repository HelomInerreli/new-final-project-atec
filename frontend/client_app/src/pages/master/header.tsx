import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import "../../i18n";
import { useTranslation } from "react-i18next";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import ReactCountryFlag from "react-country-flag";
import NavDropdown from "react-bootstrap/esm/NavDropdown";
import { CreateAppointmentModal } from "../../components/CreateAppointmentModal";
import LoginModal from "../../components/LoginModal";
import { useAuth } from "../../api/auth";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isLoggedIn, loggedInCustomerId, logout /*checkAuth*/ } = useAuth();

  // const debugAuth = () => {
  //   console.log('=== AUTH DEBUG ===');
  //   console.log('Is Logged In:', isLoggedIn);
  //   console.log('Customer ID:', loggedInCustomerId);
  //   console.log('Token in localStorage:', localStorage.getItem('access_token'));
  //   console.log('Re-checking auth:', checkAuth());
  //   console.log('==================');
  // };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: t("clientList"), href: "/clients" },
    { label: t("serviceList"), href: "/services" },
    { label: t("appointmentList"), href: "/appointments" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  // Função para verificar se a rota está ativa
  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      <header
        className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top ${className}`}
        style={{ zIndex: 1030 }}
      >
        <div className="container">
          {/* Logo */}
          <a className="navbar-brand d-flex align-items-center" href="/">
            <Logo scale={0.6} showSubtitle={false} />
          </a>

          {/* Toggle button para mobile */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu */}
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
            id="navbarNav"
          >
            {/* Menu Items */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {menuItems.map((item) => (
                <li key={item.label} className="nav-item">
                  <a
                    className={`nav-link ${
                      isActiveRoute(item.href)
                        ? "active text-danger fw-bold"
                        : ""
                    }`}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={
                      isActiveRoute(item.href)
                        ? { borderBottom: "2px solid #dc3545" }
                        : {}
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Botões de Ação */}
            <div className="d-flex flex-column flex-lg-row gap-2">
              {/* BOTÃO AGENDAR SERVIÇO (só aparece se logado) */}
              {/* {isLoggedIn && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setShowCreateModal(true)}
                  title="Agendar Novo Serviço"
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  <span className="d-none d-lg-inline">Schedule Service</span>
                  <span className="d-lg-none">Agendar</span>
                </button>
              )} */}
              {/* Seletor de idioma com bandeiras */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-language"
                  size="sm"
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#6c757d",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0.375rem 0.75rem",
                  }}
                >
                  {(() => {
                    const lng = i18n.language || "en";
                    const countryCode = lng.startsWith("pt")
                      ? "PT"
                      : lng.startsWith("es")
                      ? "ES"
                      : lng.startsWith("fr")
                      ? "FR"
                      : "GB";
                    const label = lng.startsWith("pt")
                      ? "Português"
                      : lng.startsWith("es")
                      ? "Espanhol"
                      : lng.startsWith("fr")
                      ? "Francês"
                      : "English";
                    return (
                      <>
                        <ReactCountryFlag
                          countryCode={countryCode}
                          svg
                          style={{
                            width: "20px",
                            height: "15px",
                          }}
                        />
                        <span className="d-none d-lg-inline">{label}</span>
                      </>
                    );
                  })()}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage("en");
                      try {
                        localStorage.setItem("i18nextLng", "en");
                      } catch (err) {}
                    }}
                  >
                    <span className="d-flex align-items-center">
                      <ReactCountryFlag
                        countryCode="GB"
                        svg
                        style={{
                          width: "20px",
                          height: "15px",
                          marginRight: "8px",
                        }}
                      />
                      English
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage("pt");
                      try {
                        localStorage.setItem("i18nextLng", "pt");
                      } catch (err) {}
                    }}
                  >
                    <span className="d-flex align-items-center">
                      <ReactCountryFlag
                        countryCode="PT"
                        svg
                        style={{
                          width: "20px",
                          height: "15px",
                          marginRight: "8px",
                        }}
                      />
                      Português
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage("es");
                      try {
                        localStorage.setItem("i18nextLng", "es");
                      } catch (err) {}
                    }}
                  >
                    <span className="d-flex align-items-center">
                      <ReactCountryFlag
                        countryCode="ES"
                        svg
                        style={{
                          width: "20px",
                          height: "15px",
                          marginRight: "8px",
                        }}
                      />
                      Espanhol
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage("fr");
                      try {
                        localStorage.setItem("i18nextLng", "fr");
                      } catch (err) {}
                    }}
                  >
                    <span className="d-flex align-items-center">
                      <ReactCountryFlag
                        countryCode="FR"
                        svg
                        style={{
                          width: "20px",
                          height: "15px",
                          marginRight: "8px",
                        }}
                      />
                      Francês
                    </span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* <button
                className="btn btn-warning btn-sm"
                onClick={debugAuth}
                title="Debug Auth"
              >
                Debug Auth
              </button> */}

              {!isLoggedIn ? (
                <>
                  <button
                    className="btn btn-outline-success btn-sm me-sm-2"
                    onClick={() => setShowLoginModal(true)}
                  >
                    {t("login")}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/register")}
                  >
                    {t("register")}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MODAL DE LOGIN */}
      {showLoginModal && (
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    )}
      {/* MODAL PARA CRIAR APPOINTMENT - SINTAXE CORRIGIDA */}
      {/* {isLoggedIn && (
        <CreateAppointmentModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          customerId={loggedInCustomerId}
          onSuccess={() => {
            setShowCreateModal(false);
            alert("Agendamento criado com sucesso!");
            if (location.pathname !== "/appointments") {
              window.location.href = "/appointments";
            } else {
              window.location.reload();
            }
          }}
        />
      )} */}
      
    </>
    
  );
}
