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

export async function getCurrentWorkTime(id: string | number): Promise<number> {
  try {
    const res = await http.get<{ total_worked_time: number }>(`/appointments/${id}/current_work_time`, { withCredentials: true });
    return res.data.total_worked_time;
  } catch (err) {
    console.error("getCurrentWorkTime error:", err);
    throw err;
  }
}

export async function startWork(id: string | number): Promise<void> {
  try {
    await http.patch(`/appointments/${id}/start_work`, {}, { withCredentials: true });
  } catch (err) {
    console.error("startWork error:", err);
    throw err;
  }
}

export async function pauseWork(id: string | number): Promise<void> {
  try {
    await http.patch(`/appointments/${id}/pause_work`, {}, { withCredentials: true });
  } catch (err) {
    console.error("pauseWork error:", err);
    throw err;
  }
}

export async function resumeWork(id: string | number): Promise<void> {
  try {
    await http.patch(`/appointments/${id}/resume_work`, {}, { withCredentials: true });
  } catch (err) {
    console.error("resumeWork error:", err);
    throw err;
  }
}

export async function finalizeWork(id: string | number): Promise<void> {
  try {
    await http.patch(`/appointments/${id}/finalize_work`, {}, { withCredentials: true });
  } catch (err) {
    console.error("finalizeWork error:", err);
    throw err;
  }
}

export default {
  getOrder,
  updateOrder,
  updateOrderStatus,
  getCurrentWorkTime,
  startWork,
  pauseWork,
  resumeWork,
  finalizeWork,
}










