import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Logo } from "../../components/Logo";
import '../../i18n';
import { useTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
    const { t, i18n } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: t('clientList'), href: "/clients" },
    { label: t('serviceList'), href: "/services" },
    { label: t('appointment'), href: "/booking" },
    { label: t('about'), href: "/about" },
    { label: t('contact'), href: "/contact" },
  ];

  // Função para verificar se a rota está ativa
  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
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
            {/* Adicionar seletor de idioma com bandeiras */}
            <Dropdown as={ButtonGroup}>
              {/* Show current language with flag on the main button */}
              <Button variant="outline-secondary">
                {(() => {
                  const lng = i18n.language || 'en';
                  const flag = lng.startsWith('pt') ? '🇵🇹' : '🇬🇧';
                  const label = lng.startsWith('pt') ? 'Português' : 'English';
                  return <>{flag} {label}</>;
                })()}
              </Button>

              <Dropdown.Toggle split variant="outline-secondary" id="dropdown-split-basic" />

              <Dropdown.Menu>
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
              </Dropdown.Menu>
            </Dropdown>
            <button className="btn btn-outline-success btn-sm me-sm-2">
              {t('login')}
            </button>
            <button className="btn btn-danger btn-sm">
              {t('register')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
