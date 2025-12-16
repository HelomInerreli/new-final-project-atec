import React, { type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiceOrderDetails } from "../hooks/useServiceOrderDetails";
import { Button } from "./ui/button";
import Input from "./Input";
import AddPartsModal from "./AddPartsModal";
import AddCommentModal from "./AddCommentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import "../styles/ServiceOrderDetail.css";

const ServiceOrderDetail: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    order,
    loading,
    saving,
    isPartsModalOpen,
    isCommentModalOpen,
    comments,
    parts,
    currentNormalized,
    setIsPartsModalOpen,
    setIsCommentModalOpen,
    changeStatus,
    fetchOrder,
    formatField,
    formatDate,
    formatVehicle,
    currentTime,
    formatTime,
    handleStartWork,
    handlePauseWork,
    handleResumeWork,
    handleFinalizeWork,
  } = useServiceOrderDetails(id);

  if (loading) return <div className="so-loading">Carregando...</div>;
  if (!order) return <div className="so-loading">Ordem não encontrada</div>;

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
                value={formatField(order.customer?.name) || `Cliente #${order.customer_id}`}
                className="readonly-input"
              />
              <Input
                label="Veículo"
                value={formatVehicle(order.vehicle) || `Veículo #${order.vehicle_id}`}
                className="readonly-input"
              />
              <Input
                label="Serviço"
                value={formatField(order.service?.name) || `Serviço #${order.service_id}`}
                className="readonly-input"
              />
            </div>

            <div className="so-info-column">
              <Input
                label="Status"
                value={formatField(order.status?.name) || "-"}
                className="readonly-input"
              />
              <Input
                label="Data"
                value={formatDate(order.appointment_date)}
                className="readonly-input"
              />
              <Input
                label="Tempo trabalhado"
                value={formatTime(currentTime)}
                className="readonly-input"
              />
            
            </div>
          </div>

          <div className="so-action-column">
            {/* BOTÃO INICIAR */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="so-action-btn"
                  disabled={saving || currentNormalized === "Concluída"}                >
                  Iniciar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Iniciar Ordem de Serviço?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A ordem #{order.id} será marcada como "Em Andamento". 
                    O cronômetro de trabalho será iniciado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStartWork}>
                    Sim, Iniciar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* BOTÃO PAUSAR */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="so-action-btn btn-warning"
                  disabled={saving || ["Pendente", "Concluída"].includes(currentNormalized)}
                >
                  Pausar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pausar Ordem de Serviço?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O trabalho em andamento será interrompido temporariamente. 
                    Pode retomar a qualquer momento clicando em "Iniciar".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePauseWork}>
                    Sim, Pausar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* BOTÃO FINALIZAR */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="so-action-btn btn-success"
                disabled={saving || currentNormalized === "Concluída"}
              >
                Finalizar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Finalizar Ordem de Serviço?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá marcar a ordem #{order.id} como <strong>concluída</strong>. 
                  Certifique-se de que todos os trabalhos foram finalizados e documentados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinalizeWork}>
                  Sim, Finalizar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                      <th>Código</th>
                      <th>Qtd</th>
                      <th>Preço</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p: any, i: number) => {
                      const dt = new Date(p.created_at ?? Date.now());
                      const dateStr = dt.toLocaleDateString("pt-PT", { 
                        day: "2-digit", 
                        month: "2-digit",
                        year: "numeric"
                      });
                      const timeStr = dt.toLocaleTimeString("pt-PT", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      });
                      
                      return (
                        <tr key={i}>
                          <td className="part-name-cell">{formatField(p.name)}</td>
                          <td className="part-sku-cell">{p.part_number ?? "-"}</td>
                          <td className="part-qty-cell">{p.quantity ?? 1}</td>
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