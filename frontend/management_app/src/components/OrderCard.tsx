import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import "../styles/OrderCard.css";
import type { Order } from "../interfaces/Order";

// Interface para props do componente
interface OrderCardProps {
  order: Order;
}

// Componente para exibir cartão de ordem
const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();

  // Função para obter classe CSS do status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Em Andamento":
        return "status-em-andamento";
      case "Pendente":
        return "status-pendente";
      case "Concluída":
        return "status-concluida";
      case "Cancelada":
        return "status-cancelada";
      default:
        return "";
    }
  };

  // Função para obter label do status
  const statusLabel = (() => {
    if ((order as any).status && typeof (order as any).status === "string") return (order as any).status;
    if ((order as any).status_text) return (order as any).status_text;
    const s = (order as any).status;
    if (s && typeof s === "object") return String(s.name ?? s.label ?? "");
    if ((order as any).status_name) return String((order as any).status_name);
    const id = Number((order as any).status_id ?? 0);
    if (id) {
      const STATUSES = [
        "Pendente",
        "Canceled",
        "Finalized",
        "In Repair",
        "Awaiting Approval",
        "Waitting Payment",
      ];
      const name = STATUSES[id - 1] ?? null;
      if (name) {
        const MAP: Record<string,string> = {
          "Pendente":"Pendente",
          "Canceled":"Cancelada",
          "Finalized":"Concluída",
          "In Repair":"Em Andamento",
          "Awaiting Approval":"Pendente",
          "Waitting Payment":"Em Andamento",
        };
        return MAP[name] ?? name;
      }
    }
    return "-";
  })();

  // Renderização do componente
  return (
    <div className="order-card">
      <div className="card-main">
        <h3>
          {order.id}
          <span className={`status-chip ${getStatusClass(statusLabel)}`}>
            {statusLabel}
          </span>
        </h3>

        <div className="meta">
          <div className="client">
            Cliente: <strong>{order.client}</strong>
          </div>
          <div className="service">
            Serviço: <strong>{order.service || "N/A"}</strong>
          </div>
          <div className="vehicle">
            Veículo: <strong>{order.vehicle}</strong>
          </div>
          <div className="date">
            Data: <strong>{order.date}</strong>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <Button
          variant="destructive"
          size="default"
          onClick={() => navigate(`/orders/${order.id}`)}
          aria-label={`Ver detalhes da ordem ${order.id}`}
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export default OrderCard;