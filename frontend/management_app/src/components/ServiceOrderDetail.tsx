import React, { useEffect, useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrder, updateOrderStatus } from "../services/OrderDetails";
import "../styles/ServiceOrderDetail.css";

const ServiceOrderDetail: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [partName, setPartName] = useState<string>("");
  const [partQty, setPartQty] = useState<number>(1);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (e: any) {
      alert("Erro ao carregar ordem: " + (e?.message ?? e));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const formatField = (v: any): string => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) return v.map(formatField).join(", ");
    if (typeof v === "object") return String(v.name ?? v.title ?? JSON.stringify(v));
    return String(v);
  };

  const formatDate = (d: any): string => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? String(d) : dt.toLocaleString();
    } catch {
      return String(d);
    }
  };

  const formatVehicle = (v: any): string => {
    if (!v) return "-";
    if (typeof v === "string") return v;
    const plate = v.plate ?? v.license_plate ?? "";
    const brand = v.brand ?? v.make ?? "";
    const model = v.model ?? v.model_name ?? "";
    const km = v.kilometers ?? v.km ?? null;
    const parts = [brand, model, plate].filter(Boolean);
    if (km) parts.push(`${km} km`);
    return parts.join(" ");
  };

  const changeStatus = async (newStatus: string) => {
    if (!id) return;
    if (!confirm(`Confirmar alteração de status para "${newStatus}"?`)) return;
    setSaving(true);
    try {
      await updateOrderStatus(id, newStatus);
      await fetchOrder();
    } catch (e: any) {
      alert("Erro ao atualizar status: " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const submitComment = async () => {
    if (!id || !comment.trim()) return;
    setSaving(true);
    try {
      const newComments = [...(order?.comments ?? []), { text: comment.trim(), created_at: new Date().toISOString() }];
      await updateOrder(id, { comments: newComments });
      setComment("");
      await fetchOrder();
    } catch (e: any) {
      alert("Erro ao adicionar comentário: " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const addPart = async () => {
    if (!id || !partName.trim()) return;
    setSaving(true);
    try {
      const newParts = [...(order?.parts ?? []), { name: partName.trim(), qty: partQty }];
      await updateOrder(id, { parts: newParts });
      setPartName("");
      setPartQty(1);
      await fetchOrder();
    } catch (e: any) {
      alert("Erro ao adicionar peça: " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (!order) return <div className="p-4">Ordem não encontrada</div>;

  return (
    <div className="so-fullscreen">
      <div className="so-header">
        <h2>Ordem #{order.id}</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Voltar</button>
          <button className="btn btn-primary me-1" onClick={() => changeStatus("Em Andamento")} disabled={saving || order.status === "Em Andamento"}>Iniciar</button>
          <button className="btn btn-warning me-1" onClick={() => changeStatus("Pendente")} disabled={saving || order.status === "Pendente"}>Pausar</button>
          <button className="btn btn-success" onClick={() => changeStatus("Concluída")} disabled={saving || order.status === "Concluída"}>Finalizar</button>
        </div>
      </div>

      <div className="so-content">
        <div className="row gy-4 align-items-start w-100">
          <div className="col-12 col-lg-4">
            <div><strong>Cliente:</strong> {formatField(order.customer_name ?? order.client_name ?? order.customer)}</div>
            <div><strong>Veículo:</strong> {formatVehicle(order.vehicle_info ?? order.vehicle ?? order.selected_vehicle)}</div>
            <div><strong>Serviço:</strong> {formatField(order.service_name ?? order.service)}</div>
            <div><strong>Data:</strong> {formatDate(order.appointment_date ?? order.date)}</div>
            <div><strong>Status:</strong> {formatField(order.status)}</div>
          </div>

          <div className="col-12 col-lg-4">
            <h5 className="text-center">Comentários</h5>
            {(order.comments ?? []).length ? (
              <ul className="comments-list">
                {(order.comments ?? []).map((c: any, i: number) => (
                  <li key={i}>
                    <small className="text-muted">{c.created_at ? formatDate(c.created_at) + " — " : ""}</small>
                    <div>{c.text}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted text-center mb-2">Sem comentários</div>
            )}
            <textarea className="form-control mb-2" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Adicionar comentário..." />
            <div className="d-flex justify-content-center">
              <button className="btn btn-primary" onClick={submitComment} disabled={saving || !comment.trim()}>Adicionar comentário</button>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <h5>Peças utilizadas</h5>
            {(order.parts ?? []).length ? (
              <ul>
                {(order.parts ?? []).map((p: any, i: number) => (
                  <li key={i}>{formatField(p.name ?? p)} — qty: {p.qty ?? p.quantity ?? 1}</li>
                ))}
              </ul>
            ) : (
              <div className="text-muted">Nenhuma peça registada</div>
            )}
            <div className="row g-2 align-items-end mt-3">
              <div className="col-md-7">
                <input className="form-control" placeholder="Nome da peça" value={partName} onChange={(e) => setPartName(e.target.value)} />
              </div>
              <div className="col-md-3">
                <input type="number" min={1} className="form-control" value={partQty} onChange={(e) => setPartQty(Number(e.target.value) || 1)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-outline-primary w-100" onClick={addPart} disabled={saving || !partName.trim()}>Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderDetail;
