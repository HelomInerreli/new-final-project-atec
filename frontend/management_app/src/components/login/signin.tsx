import "./sign.css";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import http, { setAuthToken } from "../../api/http";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn({
  onLoggedIn,
}: {
  onLoggedIn: (accessToken: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await http.post("/managementauth/login", { email, password });
      const token = res.data.access_token;
      const requiresPasswordChange = res.data.requires_password_change || false;

      setAuthToken(token);

      // Se requer mudança de senha, salvar flag e redirecionar
      if (requiresPasswordChange) {
        localStorage.setItem("requires_password_change", "true");
        window.location.href = "/first-password-change";
      } else {
        localStorage.removeItem("requires_password_change");
        onLoggedIn(token);
      }
    } catch (err: any) {
      // Surface more details to help diagnose environment issues
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.message;
      console.error("Login failed", {
        status,
        detail,
        url: http.defaults.baseURL,
      });
      if (status === 401) {
        setErrorMsg("Email ou palavra-passe incorretos. Tente novamente.");
      } else {
        setErrorMsg(
          `Falha no login${status ? ` (${status})` : ""}: ${
            detail ?? "Erro desconhecido"
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errorMsg && (
        <Alert variant="danger" className="mb-3">
          {errorMsg}
        </Alert>
      )}
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="utilizador@mecatec.pt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <div className="password-input-wrapper">
          <Form.Control
            type={showPassword ? "text" : "password"}
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
      </Form.Group>

      <Button
        variant="danger"
        className="btn-login"
        type="submit"
        disabled={loading}
      >
        {loading ? "A entrar..." : "Entrar"}
      </Button>
    </Form>
  );
}
