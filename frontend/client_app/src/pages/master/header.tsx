import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Logo } from "../../components/Logo";
import '../../i18n';
import { useTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import NavDropdown from "react-bootstrap/esm/NavDropdown";
import { CreateAppointmentModal } from "../../components/CreateAppointmentModal";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Simulação de usuário logado (depois virá do contexto de auth)
  const isLoggedIn = true; // Temporário
  const loggedInCustomerId = 1; // Temporário

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: t('clientList'), href: "/clients" },
    { label: t('serviceList'), href: "/services" },
    { label: t('appointmentList'), href: "/appointments" },
    { label: t('about'), href: "/about" },
    { label: t('contact'), href: "/contact" },
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
                      isActiveRoute(item.href) ? "active text-danger fw-bold" : ""
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
              {isLoggedIn && (
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => setShowCreateModal(true)}
                  title="Agendar Novo Serviço"
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  <span className="d-none d-lg-inline">Schedule Service</span>
                  <span className="d-lg-none">Agendar</span>
                </button>
              )}

              {/* Seletor de idioma com bandeiras */}
              <NavDropdown
                className="mb-lg-1 px-2"
                id="nav-dropdown-dark-example"
                title={(() => {
                    const lng = i18n.language || 'en';
                    const flag = lng.startsWith('pt') ? '🇵🇹' : lng.startsWith('es') ? '🇪🇸' : lng.startsWith('fr') ? '🇫🇷' : '🇬🇧';
                    const label = lng.startsWith('pt') ? 'Português' : lng.startsWith('es') ? 'Espanhol' : lng.startsWith('fr') ? 'Francês' : 'English';
                    return <>{flag} {label}</>;
                  })()}
              >
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage('en');
                      try { localStorage.setItem('i18nextLng', 'en'); } catch (err) {}
                    }}
                  >
                    🇬🇧 English
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage('pt');
                      try { localStorage.setItem('i18nextLng', 'pt'); } catch (err) {}
                    }}
                  >
                    🇵🇹 Português
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage('es');
                      try { localStorage.setItem('i18nextLng', 'es'); } catch (err) {}
                    }}
                  >
                    🇪🇸 Espanhol
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage('fr');
                      try { localStorage.setItem('i18nextLng', 'fr'); } catch (err) {}
                    }}
                  >
                    🇫🇷 Francês
                  </Dropdown.Item>
              </NavDropdown>
              
              <button className="btn btn-outline-success btn-sm me-sm-2">
                {t('login')}
              </button>
              <button className="btn btn-secondary btn-sm">
                {t('register')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL PARA CRIAR APPOINTMENT - SINTAXE CORRIGIDA */}
      {isLoggedIn && (
        <CreateAppointmentModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          customerId={loggedInCustomerId}
          onSuccess={() => {
            setShowCreateModal(false);
            alert('Agendamento criado com sucesso!');
            if (location.pathname !== '/appointments') {
              window.location.href = '/appointments';
            } else {
              window.location.reload(); 
            }
          }}
        />
      )}
    </>
  );
}