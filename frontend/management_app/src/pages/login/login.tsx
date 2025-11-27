import { useState } from "react";
import SignIn from "../../components/login/signin";
import TwoFactory from "../../components/login/twoFactory";
import "../../components/login/sign.css";
import Button from "react-bootstrap/Button";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  // "login" | "twofactor"
  const [mode, setMode] = useState<"login" | "twofactor">("login");

  const [tempToken, setTempToken] = useState<string>("");
  const handleToTwoFactor = (token: string) => {
    setTempToken(token);
    setMode("twofactor");
  };
  const handleBack = () => setMode("login");
  const handleLoggedIn = (accessToken: string) => {
    // redirect to app or show toast
    window.location.href = "/dashboard";
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
              {mode === "login" ? (
                <div className="login-form-wrapper">
                  <SignIn
                    onTwoFactorRequired={handleToTwoFactor}
                    onLoggedIn={handleLoggedIn}
                  />
                  <div className="login-actions">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="w-100 mt-3 shadow-sm"
                      onClick={handleToTwoFactor}
                    >
                      Simular 2FA
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="twofactor-wrapper">
                  <div className="back-action mb-3">
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={handleBack}
                      className="d-inline-flex align-items-center gap-1"
                    >
                      <ArrowLeft size={16} /> Voltar
                    </Button>
                  </div>
                  <TwoFactory
                    tempToken={tempToken}
                    onVerified={handleLoggedIn}
                  />
                </div>
              )}
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
