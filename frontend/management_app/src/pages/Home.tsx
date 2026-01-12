import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Wrench,
  Calendar,
  Users,
  Car,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import http from "../api/http";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface DashboardStats {
  inProgressAppointments: number;
  pendingAppointments: number;
  completedToday: number;
  totalVehicles: number;
  totalCustomers: number;
  lowStockItems: number;
}

export default function Home() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<DashboardStats>({
    inProgressAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    totalVehicles: 0,
    totalCustomers: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Buscar agendamentos
        const appointmentsRes = await http.get("/appointments");
        const appointments = appointmentsRes.data;

        const pending = appointments.filter((a: any) =>
          a.status?.name?.toLowerCase().includes("pendente")
        ).length;

        const inProgress = appointments.filter((a: any) => {
          const statusName = a.status?.name?.toLowerCase() || "";
          return (
            statusName.includes("andamento") || statusName.includes("pausad")
          );
        }).length;

        const today = new Date().toDateString();
        const completedToday = appointments.filter((a: any) => {
          const appointmentDate = new Date(a.appointment_date).toDateString();
          return (
            appointmentDate === today &&
            a.status?.name?.toLowerCase().includes("concluí")
          );
        }).length;

        // Buscar veículos
        const vehiclesRes = await http.get("/vehicles");
        const vehicles = vehiclesRes.data;

        // Buscar clientes
        const customersRes = await http.get("/customers");
        const customers = customersRes.data;

        // Buscar produtos com stock baixo
        const productsRes = await http.get("/products");
        const products = productsRes.data;
        const lowStock = products.filter(
          (p: any) =>
            p.quantity - (p.reserveQuantity || 0) < (p.minimumStock || 0)
        ).length;

        setStats({
          inProgressAppointments: inProgress,
          pendingAppointments: pending,
          completedToday: completedToday,
          totalVehicles: vehicles.length,
          totalCustomers: customers.length,
          lowStockItems: lowStock,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const isManager = user
    ? user.is_manager ||
      ["admin", "manager"].includes(user.role.toLowerCase()) ||
      (user.employee_role?.name && ["gestor", "gerente"].includes(user.employee_role.name.toLowerCase()))
    : false;

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">
          Sistema de Gestão de Oficina
        </h1>
        <p className="text-lg text-gray-600">
          {user ? `Bem-vindo, ${user.name}!` : "Bem-vindo!"} Aqui está o resumo
          das operações de hoje.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "2px solid #dc2626",
          }}
        >
          <div
            className="spinner-border text-danger"
            role="status"
            style={{ width: "3rem", height: "3rem", marginBottom: "1rem" }}
          >
            <span className="visually-hidden">A carregar...</span>
          </div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            A carregar estatísticas...
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Por favor, aguarde
          </p>
        </div>
      )}

      {/* Cards de Estatísticas */}
      {!loading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Agendamentos Pendentes */}
            <Card className="border-2 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agendamentos Pendentes
                </CardTitle>
                <Clock className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.pendingAppointments}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ordens aguardando atendimento
                </p>
              </CardContent>
            </Card>

            {/* Concluídos Hoje */}
            <Card className="border-2 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Concluídos Hoje
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.completedToday}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Serviços finalizados hoje
                </p>
              </CardContent>
            </Card>

            {/* Agendamentos em Andamento */}
            <Card className="border-2 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agendamentos em Andamento
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.inProgressAppointments}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Em execução ou pausados
                </p>
              </CardContent>
            </Card>

            {isManager && (
              <>
                {/* Total de Clientes */}
                <Card className="border-2 border-red-600 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Clientes Registados
                    </CardTitle>
                    <Users className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.totalCustomers}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Base de clientes ativa
                    </p>
                  </CardContent>
                </Card>

                {/* Total de Veículos */}
                <Card className="border-2 border-red-600 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Veículos Cadastrados
                    </CardTitle>
                    <Car className="h-5 w-5 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {stats.totalVehicles}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Frota em gestão
                    </p>
                  </CardContent>
                </Card>

                {/* Stock Baixo */}
                <Card className="border-2 border-red-600 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Alertas de Stock
                    </CardTitle>
                    <Package className="h-5 w-5 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.lowStockItems}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Produtos abaixo do mínimo
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Seção de Acesso Rápido */}
          <Card className="border-2 border-red-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-red-600" />
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/orders"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Wrench className="h-8 w-8 text-red-600 mb-2" />
                  <span className="font-semibold text-gray-900">
                    Ordens de Serviço
                  </span>
                </Link>
                <Link
                  to="/appointments"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Calendar className="h-8 w-8 text-red-600 mb-2" />
                  <span className="font-semibold text-gray-900">
                    Agendamentos
                  </span>
                </Link>
                <Link
                  to="/vehicles"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Car className="h-8 w-8 text-red-600 mb-2" />
                  <span className="font-semibold text-gray-900">Veículos</span>
                </Link>
                <Link
                  to="/stock"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Package className="h-8 w-8 text-red-600 mb-2" />
                  <span className="font-semibold text-gray-900">Stock</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
