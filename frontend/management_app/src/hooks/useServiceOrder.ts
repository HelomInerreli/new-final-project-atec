import { useCallback, useEffect, useState } from "react";
import { getAppointments, getCustomerVehicles } from "../services/ServiceOrders";
import type { Appointment } from "../interfaces/Appointment";
import type { Order } from "../interfaces/Order";

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

const buildVehicleLabel = (v: any) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  
  // Usa brand + model + plate (campos corretos do Vehicle model)
  const brandModel = `${v.brand ?? ""} ${v.model ?? ""}`.trim();
  return brandModel || v.plate || null;
};

const mapAppointmentToOrder = (
  raw: Appointment | any,
  vehicleIdMap?: Map<string, string>,
  customerVehicleMap?: Map<string, string>
): Order => {
  const dt = raw?.appointment_date ? new Date(raw.appointment_date) : null;
  const formattedDate = dt 
    ? dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) 
    : "";

  
  const client = raw?.customer?.name ?? `Cliente #${raw?.customer_id ?? "-"}`;


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

    
      const customerIds = Array.from(
        new Set(
          (appts ?? [])
            .map((a: any) => a.customer_id)
            .filter(Boolean)
            .map(String)
        )
      );

      const customerVehicleMap = new Map<string, string>();
      const vehicleIdMap = new Map<string, string>();

      if (customerIds.length) {
        await Promise.all(
          customerIds.map(async (cid) => {
            try {
              const vehicles = await getCustomerVehicles(Number(cid));
              if (Array.isArray(vehicles) && vehicles.length) {
                const firstLabel = buildVehicleLabel(vehicles[0]);
                if (firstLabel) customerVehicleMap.set(cid, firstLabel);
                
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

      const mapped = (appts ?? []).map((a: any) =>
        mapAppointmentToOrder(a, vehicleIdMap, customerVehicleMap)
      );
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