import { useState, type FC } from "react";
import { useServiceOrder } from "../hooks/useServiceOrder";
import OrderCard from "../components/OrderCard";
import CreateServiceOrderModal from "../components/CreateServiceOrderModal";
import "../styles/ServiceOrders.css";
import type { Order } from "../interfaces/Order";

const ServiceOrders: FC = () => {
  const { orders, loading, error, refresh } = useServiceOrder();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos os Status");
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  const filtered = orders.filter((o: Order) => {
    const q = searchTerm.trim().toLowerCase();
    const client = String(o.client ?? "").toLowerCase();
    const vehicle = String(o.vehicle ?? "").toLowerCase();
    const id = String(o.id ?? "").toLowerCase();
    const matchesSearch = q === "" || client.includes(q) || vehicle.includes(q) || id.includes(q);
    const matchesStatus = filterStatus === "Todos os Status" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="so-container">
      <div className="so-content-wrapper">
        <header className="so-header">
          <h1 className="so-title">Ordens de Serviço</h1>
          <div className="so-actions">
            <input
              type="text"
              placeholder="Buscar por cliente, veículo ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input form-control me-2"
              style={{ maxWidth: 420 }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: 200 }}
            >
              <option>Todos os Status</option>
              <option>Em Andamento</option>
              <option>Pendente</option>
              <option>Concluída</option>
              <option>Cancelada</option>
            </select>
          </div>

          <button
            className="new-order-button"
            onClick={() => setShowNewModal(true)}
            aria-label="Nova Ordem"
          >
            + Nova Ordem
          </button>
        </header>

        {loading && <div className="mt-4">Carregando ordens...</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {!loading && !error && (
          <main className="orders-list mt-3">
            {filtered.length > 0 ? (
              filtered.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="alert alert-info">Nenhuma Ordem de Serviço encontrada com os filtros atuais.</div>
            )}
          </main>
        )}

        <CreateServiceOrderModal
          show={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            refresh();
          }}
        />
      </div>
    </div>
  );
};

export default ServiceOrders;

