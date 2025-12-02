import { useState, type FC } from "react";
import { useServiceOrder } from "../hooks/useServiceOrder";
import OrderCard from "../components/OrderCard";
import CreateServiceOrderModal from "../components/CreateServiceOrderModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Search } from "lucide-react";
import "../styles/ServiceOrders.css";
import type { Order } from "../interfaces/Order";

const ServiceOrders: FC = () => {
  const { orders, loading, error, refresh } = useServiceOrder();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  const filtered = orders.filter((o: Order) => {
    const q = searchTerm.trim().toLowerCase();
    const client = String(o.client ?? "").toLowerCase();
    const vehicle = String(o.vehicle ?? "").toLowerCase();
    const id = String(o.id ?? "").toLowerCase();
    const matchesSearch = q === "" || client.includes(q) || vehicle.includes(q) || id.includes(q);
    
    if (filterStatus === "all") return matchesSearch;
    const matchesStatus = o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="so-container">
      <div className="so-content-wrapper">
        <header className="so-header">
          <h1 className="so-title">Ordens de Serviço</h1>
          
          <Button 
            variant="destructive" 
            size="default"
            onClick={() => setShowNewModal(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Ordem
          </Button>
        </header>

        <div className="so-actions">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder=".    Buscar por cliente, veículo ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="form-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && <div className="loading-message">Carregando ordens...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <main className="orders-list">
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