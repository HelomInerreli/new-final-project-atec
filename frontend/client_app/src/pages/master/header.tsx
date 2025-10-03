import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Logo } from "../../components/Logo";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Lista de Clientes", href: "/clients" },
    { label: "Serviços", href: "/services" },
    { label: "Agendamento", href: "/booking" },
    { label: "Sobre", href: "/about" },
    { label: "Contato", href: "/contact" },
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
            <button className="btn btn-outline-secondary btn-sm me-lg-2">
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
