/**
 * Hook personalizado para gerenciar ordens de serviço.
 * Permite buscar agendamentos, mapear para ordens e gerenciar veículos.
 */

import { useCallback, useEffect, useState } from "react";
// Importa hooks do React
import { getAppointments, getCustomerVehicles } from "../services/ServiceOrders";
// Serviços para agendamentos e veículos
import type { Appointment } from "../interfaces/Appointment";
// Tipo para agendamento
import type { Order } from "../interfaces/Order";
// Tipo para ordem

// Função para normalizar status
export function normalizeStatus(s?: string | null): Order["status"] {
  const raw = String(s ?? "").trim();
  const str = raw.toLowerCase();
  if (!str) return "Pendente";

  if (str.includes("pend") || str.includes("await") || str.includes("approval")) return "Pendente";
  if (str.includes("waitt") || str.includes("payment")) return "Em Andamento";
  if (str.includes("in repair") || str.includes("repair")) return "Em Andamento";
  if (str.includes("concl") || str.includes("finish") || str.includes("completed") || str.includes("final")) return "Concluída";
  if (str.includes("cancel")) return "Cancelada";

  return "Em Andamento";
}

// Função para construir label do veículo
const buildVehicleLabel = (v: any) => {
  if (!v) return null;
  if (typeof v === "string") return v;

  // Usa brand + model + plate (campos corretos do Vehicle model)
  const brandModel = `${v.brand ?? ""} ${v.model ?? ""}`.trim();
  return brandModel || v.plate || null;
};

// Função para mapear agendamento para ordem
const mapAppointmentToOrder = (
  raw: Appointment | any,
  vehicleIdMap?: Map<string, string>,
  customerVehicleMap?: Map<string, string>
): Order => {
  // Formata data
  const dt = raw?.appointment_date ? new Date(raw.appointment_date) : null;
  const formattedDate = dt
    ? dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "";

  // Define cliente
  const client = raw?.customer?.name ?? `Cliente #${raw?.customer_id ?? "-"}`;

  // Trata veículo como objeto
  const vehObj = raw?.vehicle;
  if (vehObj && typeof vehObj === "object") {
    const label = buildVehicleLabel(vehObj) ?? `Veículo #${raw?.vehicle_id ?? "-"}`;
    return {
      id: String(raw?.id ?? "—"),
      client,
      service: raw?.service?.name ?? `Serviço #${raw?.service_id ?? "-"}`,
      vehicle: label,
      date: formattedDate,
      value: Number(raw?.estimated_budget ?? 0),
      status: normalizeStatus(raw?.status?.name ?? ""),
    } as Order;
  }

  // Trata veículo por ID
  const vehicleId = raw?.vehicle_id;
  const vehFromId = vehicleId && vehicleIdMap ? vehicleIdMap.get(String(vehicleId)) : undefined;
  const custId = String(raw?.customer_id ?? "");
  const vehFromCustomer = custId && customerVehicleMap ? customerVehicleMap.get(custId) : undefined;
  const vehicleLabel = vehFromId ?? vehFromCustomer ?? `Veículo #${vehicleId ?? "-"}`;

  return {
    id: String(raw?.id ?? "—"),
    client,
    service: raw?.service?.name ?? `Serviço #${raw?.service_id ?? "-"}`,
    vehicle: vehicleLabel,
    date: formattedDate,
    value: Number(raw?.estimated_budget ?? 0),
    status: normalizeStatus(raw?.status?.name ?? ""),
  } as Order;
};

/**
 * Hook para gerenciar ordens de serviço.
 * @returns Estado e funções para ordens
 */
export function useServiceOrder() {
  // Estado para agendamentos brutos
  const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
  // Estado para ordens mapeadas
  const [orders, setOrders] = useState<Order[]>([]);
  // Estado de carregamento
  const [loading, setLoading] = useState(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Função para buscar agendamentos
  const fetchAppointments = useCallback(async () => {
    // Inicia carregamento
    setLoading(true);
    setError(null);
    try {
      // Busca agendamentos
      const appts = await getAppointments();
      setRawAppointments(appts ?? []);

      // Coleta IDs de clientes únicos
      const customerIds = Array.from(
        new Set(
          (appts ?? [])
            .map((a: any) => a.customer_id)
            .filter(Boolean)
            .map(String)
        )
      );

      // Mapas para veículos
      const customerVehicleMap = new Map<string, string>();
      const vehicleIdMap = new Map<string, string>();

      if (customerIds.length) {
        // Busca veículos para cada cliente
        await Promise.all(
          customerIds.map(async (cid) => {
            try {
              const vehicles = await getCustomerVehicles(Number(cid));
              if (Array.isArray(vehicles) && vehicles.length) {
                // Define primeiro veículo do cliente
                const firstLabel = buildVehicleLabel(vehicles[0]);
                if (firstLabel) customerVehicleMap.set(cid, firstLabel);

                // Mapeia todos os veículos
                vehicles.forEach((v: any) => {
                  const vid = String(v.id ?? "");
                  const lab = buildVehicleLabel(v);
                  if (vid && lab) vehicleIdMap.set(vid, lab);
                });
              }
            } catch {
              /* ignore per-customer fetch errors */
            }
          })
        );
      }

      // Mapeia agendamentos para ordens
      const mapped = (appts ?? []).map((a: any) =>
        mapAppointmentToOrder(a, vehicleIdMap, customerVehicleMap)
      );
      setOrders(mapped);
    } catch (err: any) {
      // Define erro
      setError(err?.message ?? "Erro ao carregar ordens");
    } finally {
      // Finaliza carregamento
      setLoading(false);
    }
  }, []);

  // Efeito para buscar agendamentos na montagem
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Retorna estado e funções
  return {
    rawAppointments,
    orders,
    loading,
    error,
    refresh: fetchAppointments,
    setOrders,
  };
}