import { useCallback, useEffect, useState } from "react";
import { getAppointments, getCustomerVehicles } from "../services/ServiceOrders";
import type { Appointment } from "../interfaces/Appointment";
import type { Order } from "../interfaces/Order";


export function normalizeStatus(s?: string | null): Order["status"] {
  const raw = String(s ?? "").trim();
  const str = raw.toLowerCase();
  if (!str) return "Pendente";

  // "Awaiting Approval" -> Pendente
  if (str.includes("pend") || str.includes("await") || str.includes("approval")) return "Pendente";

  // pagamentos pendentes -> Em Andamento
  if (str.includes("waitt") || str.includes("payment")) return "Em Andamento";

  // In Repair -> Em Andamento
  if (str.includes("in repair") || str.includes("repair")) return "Em Andamento";

  if (str.includes("concl") || str.includes("finish") || str.includes("completed") || str.includes("final")) return "Concluída";
  if (str.includes("cancel")) return "Cancelada";

  // fallback
  return "Em Andamento";
};

const buildVehicleLabel = (v: any) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  const primary = (v.display_name ?? `${v.brand ?? v.make ?? ""} ${v.model ?? ""}`.trim());
  return primary || v.plate || v.name || null;
};

const mapAppointmentToOrder = (raw: Appointment | any, vehicleIdMap?: Map<string, string>, customerVehicleMap?: Map<string, string>): Order => {
  const dt = raw?.appointment_date ? new Date(raw.appointment_date) : null;
  const formattedDate = dt ? dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : String(raw?.appointment_date ?? raw?.date ?? "");
  const client = raw?.customer_name ?? raw?.client_name ?? raw?.customer?.name ?? (raw?.customer?.full_name ? raw.customer.full_name : undefined) ?? `#${raw?.customer_id ?? "-"}`;

  const vehObj = raw?.selected_vehicle ?? raw?.vehicle ?? raw?.customer_vehicle ?? raw?.selectedVehicle;
  if (vehObj && typeof vehObj === "object") {
    const label = buildVehicleLabel(vehObj) ?? raw?.service_name ?? `#${raw?.vehicle_id ?? "-"}`;
    return {
      id: String(raw?.order_number ?? raw?.id ?? "—"),
      client,
      service: raw?.service_name ?? `#${raw?.service_id ?? "-"}`,
      vehicle: String(label),
      date: formattedDate,
      value: Number(raw?.estimated_budget ?? raw?.service_price ?? raw?.price ?? 0),
      status: normalizeStatus(raw?.status?.name ?? raw?.status ?? ""),
    } as Order;
  }

  const vehicleId = raw?.selected_vehicle_id ?? raw?.vehicle_id ?? raw?.client_vehicle_id ?? raw?.customer_vehicle_id;
  const vehFromId = vehicleId && vehicleIdMap ? vehicleIdMap.get(String(vehicleId)) : undefined;
  const vehicleFromFields = raw?.vehicle_info ?? raw?.vehicle_name ?? raw?.vehicle_model ?? raw?.client_vehicle ?? null;
  const custId = String(raw?.customer_id ?? raw?.customer?.id ?? "");
  const vehFromCustomer = custId && customerVehicleMap ? customerVehicleMap.get(custId) : undefined;

  const vehicleLabel = vehFromId ?? vehicleFromFields ?? vehFromCustomer ?? raw?.service_name ?? `#${vehicleId ?? "-"}`;

  return {
    id: String(raw?.order_number ?? raw?.id ?? "—"),
    client,
    service: raw?.service_name ?? `#${raw?.service_id ?? "-"}`,
    vehicle: String(vehicleLabel),
    date: formattedDate,
    value: Number(raw?.estimated_budget ?? raw?.service_price ?? raw?.price ?? 0),
    status: normalizeStatus(raw?.status?.name ?? raw?.status ?? ""),
  } as Order;
};

export function useServiceOrder() {
  const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appts = await getAppointments();
      setRawAppointments(appts ?? []);

      const customerIds = Array.from(new Set((appts ?? []).map((a: any) => a.customer_id ?? a.customer?.id).filter(Boolean).map(String)));

      const customerVehicleMap = new Map<string, string>();
      const vehicleIdMap = new Map<string, string>();

      if (customerIds.length) {
        await Promise.all(customerIds.map(async (cid) => {
          try {
            const vehicles = await getCustomerVehicles(Number(cid));
            if (Array.isArray(vehicles) && vehicles.length) {
              const firstLabel = buildVehicleLabel(vehicles[0]);
              if (firstLabel) customerVehicleMap.set(cid, firstLabel);
              vehicles.forEach((v: any) => {
                const vid = String(v.id ?? v.pk ?? v.vehicle_id ?? v._id ?? "");
                const lab = buildVehicleLabel(v);
                if (vid && lab) vehicleIdMap.set(vid, lab);
              });
            }
          } catch {
            /* ignore per-customer fetch errors */
          }
        }));
      }

      const mapped = (appts ?? []).map((a: any) => mapAppointmentToOrder(a, vehicleIdMap, customerVehicleMap));
      setOrders(mapped);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar ordens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    rawAppointments,
    orders,
    loading,
    error,
    refresh: fetchAppointments,
    setOrders,
  };
}