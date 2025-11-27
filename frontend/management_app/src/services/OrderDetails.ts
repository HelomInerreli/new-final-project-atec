import http from "../api/http";
import type { Appointment } from "../interfaces/Appointment";

export async function getOrder(id: string | number): Promise<Appointment> {
  try {
    const res = await http.get<Appointment>(`/appointments/${id}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("getOrder error:", err);
    throw err;
  }
}

export async function updateOrder(id: string | number, payload: any): Promise<Appointment> {
  try {
    const res = await http.patch<Appointment>(`/appointments/${id}`, payload, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("updateOrder error:", err);
    throw err;
  }
}

export async function updateOrderStatus(id: string | number, status: string): Promise<Appointment> {
  return updateOrder(id, { status });
}

export default {
  getOrder,
  updateOrder,
  updateOrderStatus,
}









