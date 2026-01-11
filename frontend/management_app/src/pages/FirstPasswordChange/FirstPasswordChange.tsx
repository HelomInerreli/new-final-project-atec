import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import "./FirstPasswordChange.css";

/**
 * Página para mudança obrigatória de senha no primeiro acesso
 */
export default function FirstPasswordChange() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      await axios.post(
        "http://localhost:8000/api/v1/managementauth/me/first-password-change",
        { new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Senha alterada com sucesso!");

      // Remover flag e recarregar página
      localStorage.removeItem("requires_password_change");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      const errorMsg = err.response?.data?.detail || "Erro ao alterar senha";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-password-change-wrapper">
      <div className="first-password-change-overlay" />
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-auto">
            <div className="password-change-card">
              <header className="password-change-header">
                <h2 className="password-change-title">MECATEC OFICINA</h2>
                <p className="password-change-subtitle">
                  Primeiro acesso - Altere sua senha
                </p>
                <p className="password-change-description">
                  Por motivos de segurança, você deve alterar a senha padrão
                  antes de continuar.
                </p>
              </header>

              <div className="password-change-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-control"
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                    <small className="form-text text-muted">
                      Mínimo de 6 caracteres
                    </small>
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-control"
                      placeholder="Digite novamente sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger w-100 btn-change-password"
                    disabled={loading}
                  >
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </button>
                </form>
              </div>

              <footer className="password-change-footer">
                <small className="text-light-50">
                  © {new Date().getFullYear()} Mecatec • Segurança & Performance
                </small>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
