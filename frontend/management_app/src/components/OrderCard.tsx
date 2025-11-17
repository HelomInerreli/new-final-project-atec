// import React from "react";
// import "../styles/OrderCard.css";
// import type { Order } from "../interfaces/Order";

// interface OrderCardProps {
//   order: Order;
// }

// const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
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

//   return (
//     <div className="order-card">
//       <div className="card-main">
//         <h3>
//           {order.id}
//           <span className={`status-chip ${getStatusClass(order.status)}`} style={{ marginLeft: 8 }}>
//             {order.status}
//           </span>
//         </h3>
//         <div className="meta">
//           <div className="client">Cliente: <strong>{order.client}</strong></div>
//           <div className="service">Serviço: <strong>{order.service}</strong></div>
//           <div className="vehicle">Veículo: <strong>{order.vehicle}</strong></div>
//           <div className="date">Data: <strong>{order.date}</strong></div>
//         </div>
//         <p className="price">R$ {order.value.toFixed(2).replace(".", ",")}</p>
//       </div>

//       <div className="card-actions">
//         <button className="btn-action" onClick={() => alert(`Visualizar detalhes da ${order.id}`)}>
//           Ver Detalhes
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderCard;

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

  const value = Number(order.value ?? 0).toFixed(2).replace(".", ",");

  return (
    <div className="order-card">
      <div className="card-main">
        <h3>
          {order.id}
          <span className={`status-chip ${getStatusClass(order.status)}`} style={{ marginLeft: 8 }}>
            {order.status}
          </span>
        </h3>
        <div className="meta">
          <div className="client">Cliente: <strong>{order.client}</strong></div>
          <div className="service">Serviço: <strong>{order.service}</strong></div>
          <div className="vehicle">Veículo: <strong>{order.vehicle}</strong></div>
          <div className="date">Data: <strong>{order.date}</strong></div>
        </div>
        <p className="price">R$ {value}</p>
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