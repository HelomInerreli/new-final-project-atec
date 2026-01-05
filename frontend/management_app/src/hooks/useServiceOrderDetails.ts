import { useState, useEffect, useCallback } from "react";
import { getOrder, updateOrder, getCurrentWorkTime, startWork, pauseWork, resumeWork, finalizeWork } from "../services/OrderDetails";
import { normalizeStatus } from "./useServiceOrder";
import { STATUS_LABEL_TO_ID } from "../interfaces/ServiceOrderDetail";
import { format } from "date-fns";

export const useServiceOrderDetails = (id: string | undefined) => {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  // Fetch order
  const fetchOrder = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (e: any) {
      alert("Erro ao carregar ordem: " + (e?.message ?? e));
      setOrder(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  const fetchCurrentWorkTime = useCallback(async () => {
    if (!id) return;
    try {
      const time = await getCurrentWorkTime(id);
      setCurrentTime(time);
    } catch (e) {
      console.error("Erro ao buscar tempo de trabalho atual:", e);
    }
  }, [id]);


  // Initial load
  useEffect(() => {
    fetchOrder();
    fetchCurrentWorkTime();
  }, [fetchOrder]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!id || !order) return;
    const interval = setInterval(() => {
      fetchOrder(true);
      fetchCurrentWorkTime();
    }, 10000);
    return () => clearInterval(interval);
  }, [id, order, fetchOrder, fetchCurrentWorkTime]);

  useEffect(() => {
    if (!order?.start_time || order?.is_paused) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [order?.start_time, order?.is_paused]);
  
  // work actions
  const handleStartWork = useCallback(async () => {
    console.log('handleStartWork called, id:', id, 'order?.is_paused:', order?.is_paused, 'order:', order);
    if (!id) return;
    try {
      if(order?.is_paused) {
        console.log('calling resumeWork for id ', id);
        await resumeWork(id);
      } else {
        console.log('calling startWork for id ', id);
        await startWork(id);
      }
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      console.error("Erro ao iniciar trabalho:", e);
      alert("Erro ao iniciar trabalho: " + e);
    }
  }, [id, order, fetchOrder, fetchCurrentWorkTime, resumeWork, startWork]);

  const handlePauseWork = useCallback(async () => {
    if (!id) return;
    try {
      await pauseWork(id);
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      alert("Erro ao pausar trabalho: " + e);
    }
  }, [id, fetchOrder, fetchCurrentWorkTime]);

  const handleResumeWork = useCallback(async () => {
    if (!id) return;
    try {
      await resumeWork(id);
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      alert("Erro ao retomar trabalho: " + e);
    }
  }, [id, fetchOrder, fetchCurrentWorkTime]);

  const handleFinalizeWork = useCallback(async () => {
    if (!id) return;
    try {
      await finalizeWork(id);
      await fetchOrder();
      await fetchCurrentWorkTime();
    } catch (e) {
      alert("Erro ao finalizar trabalho: " + e);
    }
  }, [id, fetchOrder, fetchCurrentWorkTime]);



  // Format helpers
  const formatField = useCallback((v: any): string => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) return v.map(formatField).join(", ");
    if (typeof v === "object") return String(v.name ?? JSON.stringify(v));
    return String(v);
  }, []);

  const formatDate = useCallback((d: any): string => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? String(d) : dt.toLocaleString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(d);
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatVehicle = useCallback((v: any): string => {
    if (!v) return "-";
    if (typeof v === "string") return v;
    const plate = v.plate ?? "";
    const brand = v.brand ?? "";
    const model = v.model ?? "";
    const km = v.kilometers ?? null;
    const parts = [brand, model, plate].filter(Boolean);
    if (km) parts.push(`${km} km`);
    return parts.join(" ") || "-";
  }, []);

  const getRawStatusName = useCallback((o: any): string => {
    if (!o) return "";
    const s = o.status ?? o;
    if (!s) return "";
    if (typeof s === "string") return s;
    if (typeof s === "object") return String(s.name ?? "");
    return "";
  }, []);

  // Change status
  const changeStatus = useCallback(async (action: "start" | "pause" | "finish") => {
    if (!id || !order) return;

    const newStatusLabel = action === "start" ? "Em Andamento" : action === "pause" ? "Pendente" : "Concluída";
    const currentRaw = getRawStatusName(order);
    const currentNormalized = normalizeStatus(currentRaw);

    if (currentNormalized === newStatusLabel) return;
    if (currentNormalized === "Concluída" && action !== "finish") {
      alert("Ordem já concluída.");
      return;
    }
    
    const newStatusId = STATUS_LABEL_TO_ID[newStatusLabel];
    if (!newStatusId) {
      alert("Status inválido");
      return;
    }

    setSaving(true);
    const previous = order;
    setOrder({ ...order, status_id: newStatusId });

    try {
      await updateOrder(id, { status_id: newStatusId });
      await fetchOrder();
    } catch (e: any) {
      setOrder(previous);
      alert("Erro ao atualizar status.");
    } finally {
      setSaving(false);
    }
  }, [id, order, getRawStatusName, fetchOrder]);

  // Sorted data
  const comments = (order?.comments ?? []).slice().sort((a: any, b: any) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return tb - ta;
  });

  const parts = (order?.parts ?? []).slice().sort((a: any, b: any) => {
    const ta = new Date(a.created_at ?? 0).getTime();
    const tb = new Date(b.created_at ?? 0).getTime();
    return tb - ta;
  });

  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (!id) return;
    try {
      const { deleteComment } = await import("../services/OrderDetails");
      await deleteComment(id, commentId);
      await fetchOrder();
    } catch (e) {
      alert("Erro ao apagar comentário: " + e);
    }
  }, [id, fetchOrder]);

  const handleDeletePart = useCallback(async (partId: number) => {
    if (!id) return;
    try {
      const { deletePart } = await import("../services/OrderDetails");
      await deletePart(id, partId);
      await fetchOrder();
    } catch (e) {
      alert("Erro ao apagar peça: " + e);
    }
  }, [id, fetchOrder]);


  const currentRaw = getRawStatusName(order);
  const currentNormalized = normalizeStatus(currentRaw);

  return {
    // State
    order,
    loading,
    saving,
    isPartsModalOpen,
    isCommentModalOpen,
    comments,
    parts,
    currentNormalized,
    currentTime,

    // Actions
    setIsPartsModalOpen,
    setIsCommentModalOpen,
    changeStatus,
    fetchOrder,
    handleStartWork,
    handlePauseWork,
    handleResumeWork,
    handleFinalizeWork,
    handleDeleteComment,
    handleDeletePart,

    // Helpers
    formatField,
    formatDate,
    formatTime,
    formatVehicle,
  };
};