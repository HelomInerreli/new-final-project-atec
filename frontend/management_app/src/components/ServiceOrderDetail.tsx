import { type FC, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiceOrderDetails } from "../hooks/useServiceOrderDetails";
import { Button } from "./ui/button";
import Input from "./Input";
import AddPartsModal from "./AddPartsModal";
import AddCommentModal from "./AddCommentModal";
import { Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import AddExtraServiceModal from "./AddExtraServiceModal";
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

// Componente para detalhes da ordem de serviço
const ServiceOrderDetail: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  // Estado para modal de serviço extra
  const [isExtraServiceModalOpen, setIsExtraServiceModalOpen] = useState(false);

  // Usa hook personalizado para gerenciar detalhes da ordem
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
    fetchOrder,
    formatField,
    formatDate,
    formatVehicle,
    currentTime,
    formatTime,
    handleStartWork,
    handlePauseWork,
    handleFinalizeWork,
    handleDeleteComment,
    handleDeletePart,
    handleDeleteExtraService,
  } = useServiceOrderDetails(id);

  // Estados de carregamento e erro
  if (loading) return <div className="so-loading">Carregando...</div>;
  if (!order) return <div className="so-loading">Ordem não encontrada</div>;

  // Verificar se há serviços extras pendentes
  const hasPendingExtraServices =
    order?.extra_service_associations?.some(
      (extra: any) => extra.status === "pending"
    ) || false;

  // Renderização do componente
  return (
    <div className="so-page-wrapper">
      <div className="so-card">
        <div className="so-card-header">
          <button className="so-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="so-card-title">Ordem de Serviço :{order.id}</h2>
        </div>

        <h5 className="so-section-title">Informações do Cliente e Serviço</h5>

        <div className="so-info-with-actions">
          <div className="so-info-grid-horizontal">
            <div className="so-info-column">
              <Input
                label="Cliente"
                value={
                  formatField(order.customer?.name) ||
                  `Cliente #${order.customer_id}`
                }
                className="readonly-input"
              />
              <Input
                label="Veículo"
                value={
                  formatVehicle(order.vehicle) || `Veículo #${order.vehicle_id}`
                }
                className="readonly-input"
              />
              <Input
                label="Serviço"
                value={
                  formatField(order.service?.name) ||
                  `Serviço #${order.service_id}`
                }
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
                label="Responsável"
                value={
                  order.assigned_employee
                    ? formatField(order.assigned_employee.name)
                    : "-"
                }
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
            {/* BOTÃO INICIAR/RETOMAR */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="so-action-btn btn-start"
                  disabled={
                    saving ||
                    currentNormalized === "Concluída" ||
                    order?.status?.name === "Waitting Payment" ||
                    order?.status?.name === "Finalized" ||
                    (order?.start_time && !order?.is_paused)
                  }
                >
                  {order?.is_paused ? "Retomar" : "Iniciar"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="space-y-4">
                  <AlertDialogTitle className="text-xl">
                    {order?.is_paused
                      ? "Retomar Ordem de Serviço?"
                      : "Iniciar Ordem de Serviço?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    A ordem{" "}
                    <span className="font-semibold text-red-600">
                      #{order.id}
                    </span>{" "}
                    será marcada como{" "}
                    <span className="font-semibold">"Em Andamento"</span>.
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <p className="text-sm text-gray-700">
                        ✓ O cronômetro de trabalho será iniciado
                        automaticamente.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row justify-center items-center gap-3 sm:flex-row sm:justify-center">
                  <AlertDialogCancel className="hover:bg-gray-100 m-0">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleStartWork}
                    className="bg-red-600 hover:bg-red-700 m-0"
                  >
                    {order?.is_paused ? "Retomar" : "Iniciar"}
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
                  disabled={
                    saving ||
                    ["Pendente", "Concluída"].includes(currentNormalized) ||
                    order?.status?.name === "Waitting Payment" ||
                    order?.status?.name === "Finalized" ||
                    order?.is_paused
                  }
                >
                  Pausar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="space-y-4">
                  <AlertDialogTitle className="text-xl">
                    Pausar Ordem de Serviço?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    O trabalho em andamento será interrompido temporariamente.
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <p className="text-sm text-gray-700">
                        ⚠️ Pode retomar a qualquer momento clicando em{" "}
                        <span className="font-semibold">"Retomar"</span>.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row justify-center items-center gap-3 sm:flex-row sm:justify-center">
                  <AlertDialogCancel className="hover:bg-gray-100 m-0">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePauseWork}
                    className="bg-red-600 hover:bg-red-700 m-0"
                  >
                    Pausar
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
                  disabled={
                    saving ||
                    currentNormalized === "Concluída" ||
                    currentNormalized === "Pendente" ||
                    order?.status?.name === "Waitting Payment" ||
                    order?.status?.name === "Finalized" ||
                    order?.is_paused ||
                    hasPendingExtraServices
                  }
                >
                  Finalizar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="space-y-4">
                  <AlertDialogTitle className="text-xl">
                    Finalizar Ordem de Serviço?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    Esta ação irá marcar a ordem{" "}
                    <span className="font-semibold text-red-600">
                      #{order.id}
                    </span>{" "}
                    como <span className="font-semibold">concluída</span>.
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <p className="text-sm text-gray-700">
                        ⚠️ Certifique-se de que todos os trabalhos foram
                        finalizados e documentados.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row justify-center items-center gap-3 sm:flex-row sm:justify-center">
                  <AlertDialogCancel className="hover:bg-gray-100 m-0">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleFinalizeWork}
                    className="bg-red-600 hover:bg-red-700 m-0"
                  >
                    Finalizar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="so-divider" />

        <div
          className="so-panels-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
          }}
        >
          {/* COMENTÁRIOS */}
          <div className="so-panel" style={{ minWidth: 0 }}>
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
                  const day = dt.toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                  });
                  const time = dt.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={c.id ?? i}
                      className={`timeline-item ${isLatest ? "active" : ""}`}
                    >
                      <div className="timeline-left">
                        <div className="timeline-month">{day}</div>
                        <div className="timeline-time">{time}</div>
                      </div>
                      <div className="timeline-line"></div>
                      <div className="timeline-content">
                        <div className="timeline-content-wrapper">
                          <div className="timeline-text">{c.comment}</div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="delete-icon-btn"
                                title="Eliminar comentário"
                              >
                                <Trash2 size={16} />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-md">
                              <AlertDialogHeader className="space-y-4">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                  <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <AlertDialogTitle className="text-center text-xl">
                                  Eliminar Comentário
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-center text-base">
                                  Esta ação não pode ser desfeita. Tem a certeza
                                  que deseja eliminar permanentemente este
                                  comentário?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
                                <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {isLatest && (
                            <span className="timeline-badge">NOVO</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PEÇAS */}
          <div className="so-panel" style={{ minWidth: 0 }}>
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
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p: any, i: number) => {
                      const dt = new Date(p.created_at ?? Date.now());
                      const dateStr = dt.toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });
                      const timeStr = dt.toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={i}>
                          <td className="part-name-cell">
                            {formatField(p.name)}
                          </td>
                          <td className="part-sku-cell">
                            {p.part_number ?? "-"}
                          </td>
                          <td className="part-qty-cell">{p.quantity ?? 1}</td>
                          <td className="part-date-cell">
                            <div className="part-date-cell-content">
                              <div className="part-date-info">
                                {dateStr}
                                <span className="part-time">{timeStr}</span>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="delete-icon-btn delete-icon-btn-table"
                                    title="Eliminar peça"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-md">
                                  <AlertDialogHeader className="space-y-4">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                      <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <AlertDialogTitle className="text-center text-xl">
                                      Eliminar Peça
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-center text-base">
                                      Esta ação não pode ser desfeita. Tem a
                                      certeza que deseja eliminar
                                      permanentemente esta peça? O stock será
                                      restaurado.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
                                    <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePart(p.id)}
                                      className="flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* SERVIÇOS EXTRAS */}
          <div className="so-panel" style={{ minWidth: 0 }}>
            <div className="so-panel-header">
              <h6 className="so-panel-title so-panel-title-parts">
                Serviços Extras Propostos
              </h6>
              <button
                className="so-add-icon-btn so-add-icon-btn-parts"
                onClick={() => setIsExtraServiceModalOpen(true)}
                title="Propor serviço extra"
              >
                +
              </button>
            </div>

            <div className="extras-list-wrapper">
              {!order.extra_service_associations ||
              order.extra_service_associations.length === 0 ? (
                <div className="so-empty-message">
                  Sem serviços extras propostos
                </div>
              ) : (
                <div className="extras-list">
                  {order.extra_service_associations.map(
                    (extra: any, i: number) => {
                      const statusClass =
                        extra.status === "approved"
                          ? "status-approved"
                          : extra.status === "rejected"
                          ? "status-rejected"
                          : "status-pending";

                      const statusLabel =
                        extra.status === "approved"
                          ? "Aprovado"
                          : extra.status === "rejected"
                          ? "Recusado"
                          : "Pendente";

                      return (
                        <div key={i} className={`extra-item ${statusClass}`}>
                          <div className="extra-header">
                            <h6 className="extra-name">
                              {extra.name || "Serviço Extra"}
                            </h6>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <span
                                className={`extra-status badge ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                              {extra.status === "pending" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      className="delete-icon-btn"
                                      title="Cancelar serviço extra"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="sm:max-w-md">
                                    <AlertDialogHeader className="space-y-4">
                                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                      </div>
                                      <AlertDialogTitle className="text-center text-xl">
                                        Cancelar Serviço Extra
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-center text-base">
                                        Tem a certeza que deseja cancelar este
                                        serviço extra? Esta ação não pode ser
                                        desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
                                      <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteExtraService(extra.id)
                                        }
                                        className="flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      >
                                        Confirmar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                          {extra.description && (
                            <p className="extra-description">
                              {extra.description}
                            </p>
                          )}
                          <div className="extra-footer">
                            <span className="extra-price">
                              €{Number(extra.price ?? 0).toFixed(2)}
                            </span>
                            {extra.duration_minutes && (
                              <span className="extra-duration">
                                <i className="bi bi-clock me-1"></i>
                                {extra.duration_minutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
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

      <AddExtraServiceModal
        isOpen={isExtraServiceModalOpen}
        onClose={() => setIsExtraServiceModalOpen(false)}
        orderId={id!}
        onSuccess={fetchOrder}
      />
    </div>
  );
};

export default ServiceOrderDetail;
