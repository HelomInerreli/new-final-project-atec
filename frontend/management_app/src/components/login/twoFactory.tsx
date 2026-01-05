import "./sign.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import http, { setAuthToken } from "../../api/http";

export default function TwoFactory({
  tempToken,
  onVerified,
}: {
  tempToken: string;
  onVerified: (accessToken: string) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await http.post("/managementauth/verify", {
        tempToken,
        code,
      });
      const token = res.data.access_token;
      setAuthToken(token);
      onVerified(token);
    } catch (err) {
      console.error(err);
      alert("Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <br />
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="twoFactorCode">
          <Form.Control
            type="text"
            placeholder="Código de autenticação"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="danger"
          className="btn-login"
          type="submit"
          disabled={loading}
        >
          {loading ? "Verificando..." : "Enviar"}
        </Button>
      </Form>
    </>
  );
}
