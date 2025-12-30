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
          <div className="mb-input-wrapper" style={{ position: "relative", flex: 1 }}>
            <Search
              className="lucide lucide-search"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                color: "#9ca3af",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <input
              type="text"
              placeholder=""
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-input"
              style={{ paddingLeft: "46px", borderColor: "#dc3545" }}
              onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.nextElementSibling?.classList.remove("shrunken");
                }
              }}
            />
            <label
              className={`mb-input-label ${searchTerm ? "shrunken" : ""}`}
              style={{ left: "46px" }}
            >
              Buscar por cliente, veículo ou número...
            </label>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px] border-2 border-red-600 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" style={{ height: "56px" }}>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
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