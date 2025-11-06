import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import "../../i18n";
import { useTranslation } from "react-i18next";
import Dropdown from "react-bootstrap/Dropdown";
import ReactCountryFlag from "react-country-flag";
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isLoggedIn, loggedInCustomerName, logout, /*checkAuth*/ } = useAuth();


  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: t("serviceList"), href: "/services" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  // Função para verificar se a rota está ativa
  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  // Funções para obter nome de usuário e iniciais

  const getUserDisplayName = () => {
    if (!loggedInCustomerName) return "User";
    return loggedInCustomerName.split(" ")[0];
  };

  const getUserInitials = () => {
    if (!loggedInCustomerName) return "U";
    const names = loggedInCustomerName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };
  //

  return (
    <>
      <header
        className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top ${className}`}
        style={{ zIndex: 1030 }}
      >
        <div className="container-fluid px-3">
          {/* Logo - Far Left */}
          <a className="navbar-brand d-flex align-items-center me-0" href="/">
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
            {/* Menu Items Centered */}
            <ul className="navbar-nav position-absolute start-50 translate-middle-x mb-2 mb-lg-0 d-none d-lg-flex">
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

            {/* Menu Items for Mobile */}
            <ul className="navbar-nav d-lg-none mb-2">
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

            {/* Language Selector and User Actions - Far Right */}
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-center ms-auto">
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
                /* USER DROPDOWN MENU */
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="outline-primary"
                    id="dropdown-user"
                    size="sm"
                    className="border-0 shadow-none"
                    style={{
                      border: "1px solid #dee2e6",
                      borderRadius: "25px",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "0.375rem 0.75rem",
                      boxShadow: "none",
                    }}
                  >
                    {/* User Avatar */}
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#ca0000ff",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "600",
                        marginRight: "4px",
                      }}
                    >
                      {getUserInitials()}
                    </div>
                    <span className="d-none d-md-inline fw-medium">
                      {getUserDisplayName()}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu style={{ minWidth: "220px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                    {/* User Info Header */}
                    <div className="px-3 py-2 border-bottom bg-light">
                      <div className="fw-bold text-dark small">{loggedInCustomerName || "User"}</div>
                    </div>

                    {/* Profile Section */}
                    <Dropdown.Item
                      onClick={() => navigate("/profile")}
                      className="d-flex align-items-center py-2"
                    >
                      <i className="bi bi-person me-2 text-primary"></i>
                      {t("myProfile")}
                    </Dropdown.Item>
                    
                    <Dropdown.Item
                      onClick={() => navigate("/my-services")}
                      className="d-flex align-items-center py-2"
                    >
                    <i className="bi bi-tools me-2 text-primary"></i>
                      {t("myServices")}
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    {/* Settings Section 
                    <Dropdown.Item
                      onClick={() => navigate("/account-settings")}
                      className="d-flex align-items-center py-2"
                    >
                      <i className="bi bi-gear me-2 text-secondary"></i>
                      {t("accountSettings")}
                    </Dropdown.Item>*/}

                    <Dropdown.Item
                      onClick={() => navigate("/notifications")}
                      className="d-flex align-items-center py-2"
                    >
                      <i className="bi bi-bell me-2 text-warning"></i>
                      {t("notifications")}
                    </Dropdown.Item>


                    <Dropdown.Divider />

                    {/* Logout */}
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="d-flex align-items-center py-2 text-danger"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      {t("logout")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
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
      
      
    </>
    
  );
}
