import { useEffect, useState } from "react";
import { Layout } from "./master/Layout";
import http from "../api/http";
import { Card, Container, Button, Spinner, Alert } from "react-bootstrap";
import "./Notifications.css";

// Interface para notificação
interface Notification {
  id: number;
  component: string;
  text: string;
  insertedAt: string;
  alertType: "info" | "warning" | "danger" | "success";
}

// Componente principal de notificações
export default function Notifications() {
  // Estados para notificações e controle
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar notificações
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await http.get("/notifications/");
      setNotifications(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError("Erro ao carregar notificações");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar notificações ao montar componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Função para deletar notificação
  const handleDelete = async (id: number) => {
    try {
      await http.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Erro ao deletar notificação");
    }
  };

  // Função para obter variante do alerta
  const getAlertVariant = (alertType: string) => {
    switch (alertType) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
      default:
        return "info";
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("pt-BR");
    } catch {
      return dateString;
    }
  };

  // Renderização do componente
  return (
    <Layout>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Notificações</h1>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Carregando...
              </>
            ) : (
              "Atualizar"
            )}
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <Alert variant="info">Nenhuma notificação no momento.</Alert>
        )}

        {!loading && notifications.length > 0 && (
          <div className="notifications-container">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`notification-card mb-3 border-start border-${getAlertVariant(
                  notif.alertType
                )}`}
              >
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0">{notif.component}</h5>
                      <span
                        className={`badge bg-${getAlertVariant(
                          notif.alertType
                        )} ms-2`}
                      >
                        {notif.alertType}
                      </span>
                    </div>
                    <p className="card-text text-muted mb-1">{notif.text}</p>
                    <small className="text-muted">
                      {formatDate(notif.insertedAt)}
                    </small>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDelete(notif.id)}
                  >
                    ✕
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Layout>
  );
}
