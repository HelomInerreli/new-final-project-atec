// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/OrderCard.css";
// import type { Order } from "../interfaces/Order";

// interface OrderCardProps {
//   order: Order;
// }

// const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
//   const navigate = useNavigate();

//   const getStatusClass = (status: string) => {
//     switch (status) {
//       case "Em Andamento":
//         return "status-em-andamento";
//       case "Pendente":
//         return "status-pendente";
//       case "Concluída":
//         return "status-concluida";
//       case "Cancelada":
//         return "status-cancelada";
//       default:
//         return "";
//     }
//   };

//   const statusLabel = (() => {
//     // prioridade: status already normalized (useServiceOrder), depois status_text, depois status object/name, depois status_id -> seed
//     if ((order as any).status && typeof (order as any).status === "string") return (order as any).status;
//     if ((order as any).status_text) return (order as any).status_text;
//     const s = (order as any).status;
//     if (s && typeof s === "object") return String(s.name ?? s.label ?? "");
//     if ((order as any).status_name) return String((order as any).status_name);
//     const id = Number((order as any).status_id ?? 0);
//     if (id) {
//       const STATUSES = [
//         "Pendente",
//         "Canceled",
//         "Finalized",
//         "In Repair",
//         "Awaiting Approval",
//         "Waitting Payment",
//       ];
//       const name = STATUSES[id - 1] ?? null;
//       if (name) {
//         const MAP: Record<string,string> = {
//           "Pendente":"Pendente",
//           "Canceled":"Cancelada",
//           "Finalized":"Concluída",
//           "In Repair":"Em Andamento",
//           "Awaiting Approval":"Pendente",
//           "Waitting Payment":"Em Andamento",
//         };
//         return MAP[name] ?? name;
//       }
//     }
//     return "-";
//   })();

//   const value = Number(order.value ?? 0).toFixed(2).replace(".", ",");

//   return (
//     <div className="order-card">
//       <div className="card-main">
//         <h3>
//           {order.id}
//           <span className={`status-chip ${getStatusClass(order.status)}`}>
//             {order.status}
//           </span>
//         </h3>
        
//         <div className="meta">
//           <div className="client">
//             Cliente: <strong>{order.client}</strong>
//           </div>
//           <div className="service">
//             Serviço: <strong>{order.service || "N/A"}</strong>
//           </div>
//           <div className="vehicle">
//             Veículo: <strong>{order.vehicle}</strong>
//           </div>
//           <div className="date">
//             Data: <strong>{order.date}</strong>
//           </div>
//         </div>
        
//         <p className="price">€ {value}</p>
//       </div>

//       <div className="card-actions">
//         <button
//           className="btn-action"
//           onClick={() => navigate(`/orders/${order.id}`)}
//           aria-label={`Ver detalhes da ordem ${order.id}`}
//         >
//          Ver Detalhes
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderCard;


// ...existing code...
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrderCard.css";
import type { Order } from "../interfaces/Order";

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();

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

  const statusLabel = (() => {
    // prioridade: status já normalizado (useServiceOrder), depois status_text, depois objeto status/name, depois status_id -> map pelo seed
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

  const value = Number(order.value ?? 0).toFixed(2).replace(".", ",");

  return (
    <div className="order-card">
      <div className="card-main">
        <h3>
          {order.id}
          <span className={`status-chip ${getStatusClass(statusLabel)}`} style={{ marginLeft: 8 }}>
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

        <p className="price">€ {value}</p>
      </div>

      <div className="card-actions">
        <button
          className="btn-action"
          onClick={() => navigate(`/orders/${order.id}`)}
          aria-label={`Ver detalhes da ordem ${order.id}`}
        >
         Ver Detalhes
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
// ...existing code...


