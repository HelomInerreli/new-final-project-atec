import { useState, useEffect } from "react";
import { metricsService } from "../services/metricsService";
import { MetricCard } from "../components/Dashboard/MetricCard";
import { BarChartComponent } from "../components/Dashboard/BarChartComponent";
import { LineChartComponent } from "../components/Dashboard/LineChartComponent";
import { PieChartComponent } from "../components/Dashboard/PieChartComponent";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import type {
  DailyMetrics,
  MonthlyMetrics,
  YearlyMetrics,
  ServiceMetric,
  StatusMetric,
  SummaryMetrics,
} from "../types/metrics";

export default function Dashboard() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Estados para os dados
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics | null>(null);
  const [currentMonthMetrics, setCurrentMonthMetrics] =
    useState<MonthlyMetrics | null>(null);
  const [lastMonthMetrics, setLastMonthMetrics] =
    useState<MonthlyMetrics | null>(null);
  const [currentYearMetrics, setCurrentYearMetrics] =
    useState<YearlyMetrics | null>(null);
  const [lastYearMetrics, setLastYearMetrics] = useState<YearlyMetrics | null>(
    null
  );
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetric[]>([]);
  const [statusMetrics, setStatusMetrics] = useState<StatusMetric[]>([]);

  // Estados de loading
  const [loading, setLoading] = useState<boolean>(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadAllMetrics();
  }, []);

  const loadAllMetrics = async () => {
    setLoading(true);
    try {
      console.log("🔄 Carregando métricas...");

      const [
        dailyData,
        currentMonthData,
        lastMonthData,
        currentYearData,
        lastYearData,
        servicesData,
        statusesData,
      ] = await Promise.all([
        metricsService.getDailyMetrics().catch((e) => {
          console.error("❌ Erro daily:", e);
          return null;
        }),
        metricsService
          .getMonthlyMetrics(currentYear, currentMonth)
          .catch((e) => {
            console.error("❌ Erro current month:", e);
            return null;
          }),
        metricsService
          .getMonthlyMetrics(lastMonthYear, lastMonth)
          .catch((e) => {
            console.error("❌ Erro last month:", e);
            return null;
          }),
        metricsService.getYearlyMetrics(currentYear).catch((e) => {
          console.error("❌ Erro current year:", e);
          return null;
        }),
        metricsService.getYearlyMetrics(currentYear - 1).catch((e) => {
          console.error("❌ Erro last year:", e);
          return null;
        }),
        metricsService.getMetricsByService().catch((e) => {
          console.error("❌ Erro services:", e);
          return [];
        }),
        metricsService.getMetricsByStatus().catch((e) => {
          console.error("❌ Erro statuses:", e);
          return [];
        }),
      ]);

      console.log("✅ Dados carregados:", {
        dailyData,
        currentMonthData,
        lastMonthData,
        currentYearData,
        lastYearData,
        services: servicesData?.length,
        statuses: statusesData?.length,
      });

      setDailyMetrics(dailyData);
      setCurrentMonthMetrics(currentMonthData);
      setLastMonthMetrics(lastMonthData);
      setCurrentYearMetrics(currentYearData);
      setLastYearMetrics(lastYearData);
      setServiceMetrics(servicesData || []);
      setStatusMetrics(statusesData || []);
    } catch (error) {
      console.error("❌ Erro ao carregar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-gray-600">
          Carregando métricas...
        </div>
      </div>
    );
  }

  const getMonthName = (month: number) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[month - 1];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de Atendimentos
        </h1>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Dia Atual</TabsTrigger>
          <TabsTrigger value="monthly">Visão Mensal</TabsTrigger>
          <TabsTrigger value="yearly">Visão Anual</TabsTrigger>
        </TabsList>

        {/* ABA 1: DIA ATUAL */}
        <TabsContent value="daily" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Agendamentos"
              value={dailyMetrics?.total_appointments || 0}
              icon="📅"
              color="blue"
            />
            <MetricCard
              title="Concluídos"
              value={dailyMetrics?.completed || 0}
              icon="✅"
              color="green"
            />
            <MetricCard
              title="Em Andamento"
              value={dailyMetrics?.in_progress || 0}
              icon="⚙️"
              color="orange"
            />
            <MetricCard
              title="Pendentes"
              value={dailyMetrics?.pending || 0}
              icon="⏰"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Tempo Médio de Atendimento"
              value={`${
                dailyMetrics?.average_duration_minutes?.toFixed(0) || 0
              } min`}
              subtitle="Baseado em serviços concluídos"
              icon="⏱️"
              color="blue"
            />
            <PieChartComponent
              data={statusMetrics.filter((s) => s.total > 0)}
              dataKey="total"
              nameKey="status_name"
              title="Distribuição por Status (Hoje)"
              height={300}
            />
          </div>
        </TabsContent>

        {/* ABA 2: VISÃO MENSAL */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title={`${getMonthName(currentMonth)} ${currentYear}`}
              value={
                currentMonthMetrics?.current_month?.total_appointments || 0
              }
              subtitle={`${
                currentMonthMetrics?.current_month?.completed || 0
              } concluídos`}
              trend={{
                value:
                  currentMonthMetrics?.variations?.total_variation_percent || 0,
                isPositive:
                  (currentMonthMetrics?.variations?.total_variation_percent ||
                    0) >= 0,
              }}
              color="blue"
            />
            <MetricCard
              title={`${getMonthName(lastMonth)} ${lastMonthYear}`}
              value={lastMonthMetrics?.current_month?.total_appointments || 0}
              subtitle={`${
                lastMonthMetrics?.current_month?.completed || 0
              } concluídos`}
              color="purple"
            />
            <MetricCard
              title="Variação"
              value={`${
                currentMonthMetrics?.variations?.total_variation_percent?.toFixed(
                  1
                ) || 0
              }%`}
              subtitle="Em relação ao mês anterior"
              icon={
                (currentMonthMetrics?.variations?.total_variation_percent ||
                  0) >= 0
                  ? "📈"
                  : "📉"
              }
              color={
                (currentMonthMetrics?.variations?.total_variation_percent ||
                  0) >= 0
                  ? "green"
                  : "red"
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartComponent
              data={serviceMetrics.slice(0, 8)}
              xKey="service_name"
              yKey="total_appointments"
              title="Top 8 Serviços do Mês"
              height={350}
            />

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Serviços Mais Solicitados
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Serviço
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Área
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceMetrics.slice(0, 5).map((service, index) => (
                      <tr
                        key={service.service_id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {service.service_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {service.service_area || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {service.total_appointments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ABA 3: VISÃO ANUAL */}
        <TabsContent value="yearly" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title={`Total ${currentYear}`}
              value={currentYearMetrics?.totals?.total_appointments || 0}
              subtitle={`${
                currentYearMetrics?.totals?.completed || 0
              } concluídos`}
              color="blue"
            />
            <MetricCard
              title={`Total ${currentYear - 1}`}
              value={lastYearMetrics?.totals?.total_appointments || 0}
              subtitle={`${lastYearMetrics?.totals?.completed || 0} concluídos`}
              color="purple"
            />
            <MetricCard
              title="Média Mensal"
              value={
                currentYearMetrics?.totals?.average_per_month?.toFixed(0) || 0
              }
              subtitle={`${currentYear}`}
              icon="📊"
              color="green"
            />
            <MetricCard
              title="Taxa de Conclusão"
              value={`${(
                ((currentYearMetrics?.totals?.completed || 0) /
                  (currentYearMetrics?.totals?.total_appointments || 1)) *
                100
              ).toFixed(1)}%`}
              subtitle={`${currentYear}`}
              icon="✅"
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChartComponent
              data={currentYearMetrics?.monthly_data || []}
              xKey="month_name"
              lines={[
                { key: "total_appointments", color: "#3b82f6", name: "Total" },
                { key: "completed", color: "#10b981", name: "Concluídos" },
              ]}
              title={`Atendimentos Mensais - ${currentYear}`}
              height={350}
            />

            <LineChartComponent
              data={lastYearMetrics?.monthly_data || []}
              xKey="month_name"
              lines={[
                { key: "total_appointments", color: "#8b5cf6", name: "Total" },
                { key: "completed", color: "#059669", name: "Concluídos" },
              ]}
              title={`Atendimentos Mensais - ${currentYear - 1}`}
              height={350}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <BarChartComponent
              data={serviceMetrics.slice(0, 10)}
              xKey="service_name"
              yKey="total_appointments"
              title="Top 10 Serviços Mais Solicitados (Total)"
              height={350}
            />
          </div>

          <PieChartComponent
            data={statusMetrics}
            dataKey="total"
            nameKey="status_name"
            title="Distribuição por Status (Total)"
            height={350}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
