import { useState } from "react";
import SignIn from "../../components/login/signin";
import "../../components/login/sign.css";
import Button from "react-bootstrap/Button";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  // "login" | "twofactor"
  const [mode, setMode] = useState<"login">("login");

  const handleBack = () => setMode("login");
  const handleLoggedIn = (accessToken: string) => {
    // redirect to app or show toast
    window.location.href = "/";
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-overlay" />
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="login-card">
            <header className="login-card-header">
              <h2 className="login-title">MECATEC OFICINA</h2>
              <p className="login-subtitle">
                {mode === "login"
                  ? "Autentique-se para continuar"
                  : "Confirme a verificação em duas etapas"}
              </p>
            </header>

            <div className="login-card-body">
              <div className="login-form-wrapper">
                <SignIn onLoggedIn={handleLoggedIn} />
              </div>
            </div>

            <footer className="login-footer">
              <small className="text-light-50">
                © {new Date().getFullYear()} Mecatec • Segurança & Performance
              </small>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
