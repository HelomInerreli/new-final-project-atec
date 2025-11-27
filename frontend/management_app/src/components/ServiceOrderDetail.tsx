import React, { useEffect, useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrder } from "../services/OrderDetails";
import Input from "./Input";
import TextArea from "./TextArea";
import { normalizeStatus } from "../hooks/useServiceOrder";
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

  const getRawStatusName = (o: any): string => {
    if (!o) return "";
    const s = o.status ?? o;
    if (!s) return "";
    if (typeof s === "string") return s;
    if (typeof s === "object") return String(s.name ?? s.label ?? "");
    return "";
  };

  const changeStatus = async (action: "start" | "pause" | "finish") => {
    if (!id || !order) return;

    const STATUS_LABEL_TO_ID: Record<string, number> = {
      "Pendente": 1,
      "Cancelada": 2,
      "Concluída": 3,
      "Em Andamento": 4,
      "Aguardando Aprovação": 5,
      "Aguardando Pagamento": 6,
    };

    const newStatusLabel = action === "start" ? "Em Andamento" : action === "pause" ? "Pendente" : "Concluída";
    const currentRaw = getRawStatusName(order);
    const currentNormalized = normalizeStatus(currentRaw);

    if (currentNormalized === newStatusLabel) return;
    if (currentNormalized === "Concluída" && action !== "finish") {
      alert("Ordem já concluída.");
      return;
    }

    const ok = confirm(`Confirmar alteração de status para "${newStatusLabel}"?`);
    if (!ok) return;

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
  };

  const submitComment = async () => {
    if (!id || !comment.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/appointments/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: comment.trim(),
          service_id: order.service_id
        }),
      });

      if (!response.ok) throw new Error();

      setComment("");
      await fetchOrder();
    } catch {
      alert("Erro ao adicionar comentário.");
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
    } catch {
      alert("Erro ao adicionar peça.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="so-loading">Carregando...</div>;
  if (!order) return <div className="so-loading">Ordem não encontrada</div>;

  const currentRaw = getRawStatusName(order);
  const currentNormalized = normalizeStatus(currentRaw);

  return (
    <div className="so-page-wrapper">
      <div className="so-card">
        
        {/* Header DENTRO do card */}
        <div className="so-card-header">
          <button className="so-back-btn" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <h2 className="so-card-title">Ordem de Serviço #{order.id}</h2>
        </div>

        {/* Botões de ação */}
        <div className="so-action-bar">
          <button
            className="btn btn-primary"
            onClick={() => changeStatus("start")}
            disabled={saving || ["Em Andamento", "Concluída"].includes(currentNormalized)}
          >
            Iniciar
          </button>

          <button
            className="btn btn-warning"
            onClick={() => changeStatus("pause")}
            disabled={saving || ["Pendente", "Concluída"].includes(currentNormalized)}
          >
            Pausar
          </button>

          <button
            className="btn btn-success"
            onClick={() => changeStatus("finish")}
            disabled={saving || currentNormalized === "Concluída"}
          >
            Finalizar
          </button>
        </div>

        {/* Título da secção */}
        <h5 className="so-section-title">Informações do Cliente e Serviço</h5>

        {/* Grid de informações (read-only) */}
        <div className="so-info-grid">
          <div className="so-info-row">
            <div className="so-info-col">
              <Input
                label="Cliente"
                value={formatField(order.customer_name ?? order.customer)}
                readOnly
              />
            </div>
            <div className="so-info-col">
              <Input
                label="Veículo"
                value={formatVehicle(order.vehicle_info ?? order.vehicle)}
                readOnly
              />
            </div>
            <div className="so-info-col">
              <Input
                label="Serviço"
                value={formatField(order.service_name ?? order.service)}
                readOnly
              />
            </div>
            <div className="so-info-col">
              <Input
                label="Status"
                value={formatField(order.status)}
                readOnly
              />
            </div>
          </div>

          <div className="so-info-row">
            <div className="so-info-col">
              <Input
                label="Data"
                value={formatDate(order.appointment_date)}
                readOnly
              />
            </div>
            <div className="so-info-col">
              <Input
                label="Orçamento Estimado"
                value={`€ ${Number(order.estimated_budget ?? 0).toFixed(2)}`}
                readOnly
              />
            </div>
            <div className="so-info-col">
              <Input
                label="Orçamento Real"
                value={`€ ${Number(order.actual_budget ?? 0).toFixed(2)}`}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Divisória */}
        <div className="so-divider" />

        {/* Grid 2 colunas: Comentários + Peças */}
        <div className="so-panels-grid">
          
          {/* Painel Comentários */}
          <div className="so-panel">
            <h6 className="so-panel-title so-panel-title-comments">Comentários</h6>

            <div className="so-panel-list">
              {(order.comments ?? []).length === 0 ? (
                <div className="so-empty-message">Sem comentários</div>
              ) : (
                (order.comments ?? []).map((c: any, i: number) => (
                  <div key={i} className="so-comment-item">
                    <div className="so-comment-date">{formatDate(c.created_at)}</div>
                    <div className="so-comment-text">{c.comment}</div>
                  </div>
                ))
              )}
            </div>

            <TextArea
              rows={2}
              value={comment}
              onChange={(e: any) => setComment(e.target.value)}
              placeholder="Escrever comentário..."
            />
            <button
              className="btn btn-primary so-full-btn"
              onClick={submitComment}
              disabled={saving || !comment.trim()}
            >
              Adicionar Comentário
            </button>
          </div>

          {/* Painel Peças */}
          <div className="so-panel">
            <h6 className="so-panel-title so-panel-title-parts">Peças Utilizadas</h6>

            <div className="so-panel-list">
              {(order.parts ?? []).length === 0 ? (
                <div className="so-empty-message">Sem peças</div>
              ) : (
                (order.parts ?? []).map((p: any, i: number) => (
                  <div key={i} className="so-part-item">
                    <span className="so-part-name">{formatField(p.name)}</span>
                    <span className="so-part-qty">Qtd: {p.qty ?? p.quantity ?? 1}</span>
                  </div>
                ))
              )}
            </div>

            <div className="so-add-part-form">
              <Input
                label="Peça"
                placeholder="Nome"
                value={partName}
                onChange={(e: any) => setPartName(e.target.value)}
              />
              <Input
                label="Qtd"
                type="number"
                value={String(partQty)}
                onChange={(e: any) => setPartQty(Number(e.target.value) || 1)}
              />
              <button
                className="btn btn-success so-add-btn"
                onClick={addPart}
                disabled={saving || !partName.trim()}
              >
                +
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceOrderDetail;