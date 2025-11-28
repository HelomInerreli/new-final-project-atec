import React, { useEffect, useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrder } from "../services/OrderDetails";
import Input from "./Input";
import { normalizeStatus } from "../hooks/useServiceOrder";
import AddPartsModal from "./AddPartsModal";
import AddCommentModal from "./AddCommentModal";
import "../styles/ServiceOrderDetail.css";

const ServiceOrderDetail: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const fetchOrder = async (silent = false) => {
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
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!id || !order) return;
    const iv = setInterval(() => {
      fetchOrder(true);
    }, 10000);
    return () => clearInterval(iv);
  }, [id, order]);

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

  if (loading) return <div className="so-loading">Carregando...</div>;
  if (!order) return <div className="so-loading">Ordem não encontrada</div>;

  const currentRaw = getRawStatusName(order);
  const currentNormalized = normalizeStatus(currentRaw);

  const comments = (order.comments ?? []).slice().sort((a: any, b: any) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return tb - ta;
  });

  const parts = (order.parts ?? []).slice().sort((a: any, b: any) => {
    const ta = new Date(a.created_at ?? a.added_at ?? 0).getTime();
    const tb = new Date(b.created_at ?? b.added_at ?? 0).getTime();
    return tb - ta;
  });

  return (
    <div className="so-page-wrapper">
      <div className="so-card">
        <div className="so-card-header">
          <button className="so-back-btn" onClick={() => navigate(-1)}>← Voltar</button>
          <h2 className="so-card-title">Ordem de Serviço #{order.id}</h2>
        </div>

        <h5 className="so-section-title">Informações do Cliente e Serviço</h5>

        <div className="so-info-with-actions">
          <div className="so-info-grid-horizontal">
            <div className="so-info-column">
              <Input
                label="Cliente"
                value={formatField(order.customer_name ?? order.customer)}
                className="readonly-input"
              />
              <Input
                label="Veículo"
                value={formatVehicle(order.vehicle_info ?? order.vehicle)}
                className="readonly-input"
              />
              <Input
                label="Serviço"
                value={formatField(order.service_name ?? order.service)}
                className="readonly-input"
              />
            </div>

            <div className="so-info-column">
              <Input
                label="Status"
                value={formatField(order.status)}
                className="readonly-input"
              />
              <Input
                label="Data"
                value={formatDate(order.appointment_date)}
                className="readonly-input"
              />
              <Input
                label="Estimado"
                value={`€ ${Number(order.estimated_budget ?? 0).toFixed(2)}`}
                className="readonly-input"
              />
            </div>
          </div>

          <div className="so-action-column">
            <button
              className="btn btn-primary so-action-btn"
              onClick={() => changeStatus("start")}
              disabled={saving || ["Em Andamento", "Concluída"].includes(currentNormalized)}
            >
              Iniciar
            </button>
            <button
              className="btn btn-warning so-action-btn"
              onClick={() => changeStatus("pause")}
              disabled={saving || ["Pendente", "Concluída"].includes(currentNormalized)}
            >
              Pausar
            </button>
            <button
              className="btn btn-success so-action-btn"
              onClick={() => changeStatus("finish")}
              disabled={saving || currentNormalized === "Concluída"}
            >
              Finalizar
            </button>
          </div>
        </div>

        <div className="so-divider" />

        <div className="so-panels-grid">
          {/* COMENTÁRIOS */}
          <div className="so-panel">
            <div className="so-panel-header">
              <h6 className="so-panel-title so-panel-title-comments">
                Comentários (Acompanhamento)
              </h6>
              <button 
                className="so-add-icon-btn"
                onClick={() => setIsCommentModalOpen(true)}
                title="Adicionar comentário"
              >
                +
              </button>
            </div>

            <div className="timeline">
              {comments.length === 0 ? (
                <div className="so-empty-message">Sem comentários</div>
              ) : (
                comments.map((c: any, i: number) => {
                  const isLatest = i === 0;
                  const dt = new Date(c.created_at);
                  const day = dt.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
                  const time = dt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
                  
                  return (
                    <div key={c.id ?? i} className={`timeline-item ${isLatest ? "active" : ""}`}>
                      <div className="timeline-left">
                        <div className="timeline-month">{day}</div>
                        <div className="timeline-time">{time}</div>
                      </div>
                      <div className="timeline-line"></div>
                      <div className="timeline-content">
                        <span className="timeline-text">{c.comment}</span>
                        {isLatest && <span className="timeline-badge">NOVO</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PEÇAS */}
          <div className="so-panel">
        <div className="so-panel-header">
          <h6 className="so-panel-title so-panel-title-parts">
            Peças Utilizadas
          </h6>
          <button 
            className="so-add-icon-btn so-add-icon-btn-parts"
            onClick={() => setIsPartsModalOpen(true)}
            title="Adicionar peça"
          >
            +
          </button>
        </div>

        <div className="parts-table-wrapper">
          {parts.length === 0 ? (
            <div className="so-empty-message">Sem peças adicionadas</div>
          ) : (
            <table className="parts-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>SKU</th>
                  <th>Qtd</th>
                  <th>Preço</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p: any, i: number) => {
                  const dt = new Date(p.created_at ?? p.added_at ?? Date.now());
                  const dateStr = dt.toLocaleDateString("pt-PT", { 
                    day: "2-digit", 
                    month: "2-digit",
                    year: "numeric"
                  });
                  const timeStr = dt.toLocaleTimeString("pt-PT", { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  });
                  
                  const sku = p.part_number || p.sku || p.product_sku || p.code || "-";
                  
                  return (
                    <tr key={i}>
                      <td className="part-name-cell">{formatField(p.name)}</td>
                      <td className="part-sku-cell">{sku}</td>
                      <td className="part-qty-cell">{p.qty ?? p.quantity ?? 1}</td>
                      <td className="part-price-cell">€{Number(p.price ?? 0).toFixed(2)}</td>
                      <td className="part-date-cell">
                        {dateStr}
                        <span className="part-time">{timeStr}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
</div>
        </div>
      </div>

      <AddCommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        orderId={id!}
        onSuccess={fetchOrder}
      />

      <AddPartsModal
        isOpen={isPartsModalOpen}
        onClose={() => setIsPartsModalOpen(false)}
        orderId={id!}
        onSuccess={fetchOrder}
      />
    </div>
  );
};

export default ServiceOrderDetail;