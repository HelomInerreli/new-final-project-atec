import "./sign.css";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import http, { setAuthToken } from "../../api/http";

export default function SignIn({
  onTwoFactorRequired,
  onLoggedIn,
}: {
  onTwoFactorRequired: (tempToken: string) => void;
  onLoggedIn: (accessToken: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await http.post("/managementauth/login", { email, password });
      if (res.data.requiresTwoFactor) {
        onTwoFactorRequired(res.data.tempToken);
      } else {
        const token = res.data.tempToken; // direct access token
        setAuthToken(token);
        onLoggedIn(token);
      }
    } catch (err) {
      console.error(err);
      alert("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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
        <Form.Control
          type="password"
          placeholder="Palavra-passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
