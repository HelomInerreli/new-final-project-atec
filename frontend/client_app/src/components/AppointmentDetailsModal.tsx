import { useEffect, useState } from "react";
import type {
  AppointmentStatusModalProps,
  Appointment,
  ExtraService,
} from "../interfaces/appointment";
import {
  approveExtraService,
  rejectExtraService,
} from "../services/extraServices";
import { useAppointmentAutoRefresh } from "../hooks/useAppointmentAutoRefresh";
import { useCostBreakdown } from "../hooks/useCostBreakdown";
import "../styles/modal.css";

/**
 * Fases de status baseadas no banco de dados (ordem de progressão)
 * Define a sequência de estados pelos quais um agendamento pode passar
 * Tipo: Array de objetos com chave e rótulo do status
 */
const statusPhases = [
  { key: "pendente", label: "Pendente" },
  { key: "awaiting approval", label: "Aguardando Aprovação" },
  { key: "in repair", label: "Em Reparação" },
  { key: "waitting payment", label: "Aguardando Pagamento" },
  { key: "finalized", label: "Finalizado" },
];

/**
 * Função para calcular o valor de progresso baseado no status atual
 * Retorna 0% se cancelado, caso contrário calcula com base na posição no array de fases
 * @param status - Nome do status atual do agendamento
 * @returns Valor de progresso em percentagem (0-100)
 */
const getProgressValue = (status: string): number => {
  const statusLower = status?.toLowerCase();

  // Se for "canceled", retorna 0% (não progride)
  if (statusLower === "canceled") return 0;

  const currentIndex = statusPhases.findIndex(
    (phase) => phase.key === statusLower
  );

  if (currentIndex === -1) return 0; // Status desconhecido

  // Calcula porcentagem baseado no índice
  return ((currentIndex + 1) / statusPhases.length) * 100;
};

/**
 * Função para renderizar o badge de status com cor apropriada
 * Retorna um elemento span com classe Bootstrap baseada no status
 * @param status - Objeto de status do agendamento
 * @returns Elemento JSX com o badge de status
 */
const getStatusBadge = (status: Appointment["status"]) => {
  const statusName = status?.name?.toLowerCase();
  switch (statusName) {
    case "pendente":
      return <span className="badge bg-primary">Pendente</span>;
    case "awaiting approval":
      return <span className="badge bg-info">Aguardando Aprovação</span>;
    case "in repair":
      return <span className="badge bg-warning">Em Reparação</span>;
    case "waitting payment":
      return <span className="badge bg-warning">Aguardando Pagamento</span>;
    case "finalized":
      return <span className="badge bg-success">Finalizado</span>;
    case "canceled":
      return <span className="badge bg-danger">Cancelado</span>;
    default:
      return <span className="badge bg-secondary">Desconhecido</span>;
  }
};

/**
 * Componente modal para exibir detalhes completos de um agendamento
 * Mostra informações do agendamento, veículo, serviço, progresso e serviços extras
 * Permite aprovar ou rejeitar serviços extras propostos pelo mecânico
 * @param appointment - Dados do agendamento a exibir
 * @param open - Estado de abertura do modal
 * @param onOpenChange - Função callback para alterar o estado de abertura
 * @returns Componente JSX do modal ou null se não houver agendamento
 */
export function AppointmentStatusModal({
  appointment,
  open,
  onOpenChange,
}: AppointmentStatusModalProps) {
  /**
   * Efeito para adicionar/remover classe modal-open no body
   * Previne scroll da página quando o modal está aberto
   */
  // Auto-refresh do appointment a cada 5 segundos quando o modal está aberto
  const { appointment: liveAppointment } = useAppointmentAutoRefresh(
    appointment?.id ?? null,
    open,
    5000 // atualiza a cada 5 segundos
  );

  // Buscar breakdown de custos discriminado
  const { breakdown, loading: breakdownLoading } = useCostBreakdown(
    open ? (appointment?.id ?? null) : null
  );

  // Usa o appointment atualizado automaticamente se disponível, senão usa o prop
  const currentAppointment = liveAppointment || appointment;

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  /**
   * Estado para armazenar a lista de serviços extras associados ao agendamento
   * Tipo: Array de ExtraService
   * Inicia como array vazio
   */
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);

  /**
   * Estado para rastrear qual serviço está a processar uma ação (aprovar/rejeitar)
   * Tipo: number | null (ID do serviço ou null)
   * Usado para exibir loading no botão correto
   */
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  /**
   * Efeito para carregar serviços extras quando o agendamento muda
   * Atualiza o estado com os serviços extras associados ou limpa se não houver
   */
  useEffect(() => {
    if (currentAppointment) {
      if (
        currentAppointment.extra_service_associations &&
        currentAppointment.extra_service_associations.length > 0
      ) {
        setExtraServices(currentAppointment.extra_service_associations);
      } else {
        setExtraServices([]);
      }
    }
  }, [currentAppointment]);

  /**
   * Função para processar ações de aprovação ou rejeição de serviços extras
   * Chama a API apropriada e atualiza o estado local com o resultado
   * @param serviceId - ID do serviço extra a ser atualizado
   * @param action - Ação a executar: 'approved' ou 'rejected'
   */
  const handleServiceAction = async (
    serviceId: number,
    action: "approved" | "rejected"
  ) => {
    try {
      setLoadingAction(serviceId);
      let updatedService: ExtraService;

      if (action === "approved") {
        updatedService = await approveExtraService(serviceId);
      } else {
        updatedService = await rejectExtraService(serviceId);
      }

      setExtraServices((prev) =>
        prev.map((service) =>
          service.id === serviceId ? updatedService : service
        )
      );
    } catch (error) {
      console.error("Error updating service status:", error);
      alert("Erro ao atualizar o serviço. Tente novamente.");
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Retorna null se não houver agendamento para exibir
   */
  if (!appointment || !currentAppointment) return null;

  /**
   * Status do agendamento em minúsculas para comparação
   */
  const statusLower = currentAppointment.status?.name?.toLowerCase();

  /**
   * Valor de progresso calculado baseado no status atual
   */
  const progressValue = getProgressValue(currentAppointment.status?.name || "");

  /**
   * Índice da fase atual no array de fases
   * Usado para determinar quais fases já foram concluídas
   */

  const currentPhaseIndex = statusPhases.findIndex(
    (phase) => phase.key === statusLower
  );

  /**
   * Cor da barra de progresso baseada no status
   * Vermelha para cancelado, verde para finalizado, azul para outros
   */
  const barColor =
    statusLower === "canceled"
      ? "bg-danger"
      : statusLower === "finalized"
      ? "bg-success"
      : "bg-primary";

  return (
    <>
      {/* Modal container principal */}
      <div
        className={`modal fade ${open ? "show" : ""}`}
        style={{ display: open ? "block" : "none" }}
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            {/* Cabeçalho do modal com título e botão de fecho */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-calendar-event me-2"></i>
                {currentAppointment.service?.name || "Detalhes do Agendamento"}
              </h5>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge bg-success-subtle text-success-emphasis"
                  title="Atualização automática ativa"
                >
                  <i className="bi bi-arrow-repeat me-1"></i>
                  Live
                </span>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => onOpenChange(false)}
                ></button>
              </div>
            </div>

            {/* Corpo do modal com todas as informações do agendamento */}
            <div className="modal-body">
              {/* Badge de status do agendamento */}
              <div className="mb-3 text-end">
                {getStatusBadge(currentAppointment.status)}
              </div>

              {/* Secção de detalhes do agendamento (data, descrição, orçamento) */}
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-calendar me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">
                      Data do Agendamento
                    </p>
                    <p className="fw-semibold">
                      {currentAppointment.appointment_date ||
                        currentAppointment.date}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-muted text-uppercase small mb-1">
                    Descrição
                  </p>
                  <p>{currentAppointment.description}</p>
                </div>

                <div className="d-flex align-items-start">
                  <i className="bi bi-currency-euro me-3 mt-1 text-primary"></i>
                  <div className="flex-grow-1">
                    <p className="text-muted text-uppercase small mb-1">
                      Orçamento
                    </p>
                    
                    {breakdownLoading ? (
                      <p className="fw-semibold">A carregar...</p>
                    ) : breakdown ? (
                      <>
                        <p className="fw-semibold mb-2">
                          €{breakdown.total.toFixed(2)}
                        </p>
                        
                        {/* Breakdown discriminado */}
                        <div className="small text-muted">
                          <div className="mb-2">
                            <strong>{breakdown.base_service.name}</strong>
                            {breakdown.base_service.labor_cost > 0 && (
                              <div className="ms-2">
                                • Mão de Obra: €{breakdown.base_service.labor_cost.toFixed(2)}
                              </div>
                            )}
                            {breakdown.base_service.parts.length > 0 && (
                              <div className="ms-2">
                                • Peças ({breakdown.base_service.parts.length}): €
                                {breakdown.base_service.parts.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                              </div>
                            )}
                            <div className="ms-2">
                              <strong>Subtotal: €{breakdown.base_service.subtotal.toFixed(2)}</strong>
                            </div>
                          </div>
                          
                          {breakdown.extra_services.length > 0 && (
                            <div>
                              <strong>Serviços Extras Aprovados:</strong>
                              {breakdown.extra_services.map((extra, idx) => (
                                <div key={idx} className="ms-2 mt-1">
                                  <div>{extra.name}</div>
                                  {extra.labor_cost > 0 && (
                                    <div className="ms-2">
                                      • Mão de Obra: €{extra.labor_cost.toFixed(2)}
                                    </div>
                                  )}
                                  {extra.parts.length > 0 && (
                                    <div className="ms-2">
                                      • Peças ({extra.parts.length}): €
                                      {extra.parts.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                                    </div>
                                  )}
                                  <div className="ms-2">
                                    <strong>Subtotal: €{extra.subtotal.toFixed(2)}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="fw-semibold">
                        €{(currentAppointment.service?.price || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Secção de informações do veículo e serviço */}
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-car-front me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">
                      Veículo
                    </p>
                    <p className="fw-semibold">
                      {currentAppointment.vehicle?.brand}{" "}
                      {currentAppointment.vehicle?.model} -{" "}
                      {currentAppointment.vehicle?.plate}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <i className="bi bi-tools me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">
                      Serviço
                    </p>
                    <p className="fw-semibold">
                      {currentAppointment.service?.name}
                    </p>
                    {currentAppointment.service?.description && (
                      <p className="text-muted small">
                        {currentAppointment.service.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Secção de serviços extras propostos - exibida apenas se houver serviços */}
              {extraServices.length > 0 && (
                <div className="mb-4">
                  {/* Divisor com título da secção */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="flex-grow-1 border-bottom"></div>
                    <span className="px-3 text-muted small fw-bold text-uppercase">
                      Serviços Extras Propostos
                    </span>
                    <div className="flex-grow-1 border-bottom"></div>
                  </div>

                  {/* Alerta informativo sobre serviços adicionais */}
                  <div
                    className="alert alert-danger d-flex align-items-start mb-3"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-circle-fill me-2 mt-1"></i>
                    <div>
                      <div className="fw-bold">Novos Serviços Recomendados</div>
                      <div className="small">
                        O mecânico identificou {extraServices.length} serviços
                        adicionais que requerem atenção.
                      </div>
                    </div>
                  </div>

                  {/* Lista de serviços extras com opções de aceitar/recusar */}
                  <div className="d-flex flex-column gap-3">
                    {extraServices.map((service) => (
                      <div
                        key={service.id}
                        className="card border-primary-subtle shadow-sm"
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-start">
                              <div className="rounded-circle bg-primary-subtle p-2 me-3 text-primary">
                                <i className="bi bi-wrench-adjustable"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">
                                  {service.name || "Serviço Extra"}
                                </h6>
                                <p className="text-muted small mb-0">
                                  {service.description || "Sem descrição"}
                                </p>
                              </div>
                            </div>
                            <div className="text-primary fw-bold">
                              €{service.price?.toFixed(2) || "0.00"}
                            </div>
                          </div>

                          {/* Botões de ação ou status final do serviço */}
                          {service.status === "pending" ? (
                            <div className="d-flex gap-2 mt-3">
                              <button
                                className="btn btn-success flex-grow-1"
                                onClick={() =>
                                  handleServiceAction(service.id, "approved")
                                }
                                disabled={loadingAction === service.id}
                              >
                                {loadingAction === service.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                ) : (
                                  <i className="bi bi-check-lg me-2"></i>
                                )}
                                Aceitar
                              </button>
                              <button
                                className="btn btn-outline-danger flex-grow-1"
                                onClick={() =>
                                  handleServiceAction(service.id, "rejected")
                                }
                                disabled={loadingAction === service.id}
                              >
                                {loadingAction === service.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                ) : (
                                  <i className="bi bi-x-lg me-2"></i>
                                )}
                                Recusar
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`mt-3 p-2 rounded text-center fw-bold ${
                                service.status === "approved"
                                  ? "bg-success-subtle text-success"
                                  : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {service.status === "approved" ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Aceite
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-x-circle-fill me-2"></i>
                                  Recusado
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secção de estado da reparação com timeline visual */}
              <div className="border-top pt-4">
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-clock me-2 text-primary"></i>
                  <h5 className="fw-semibold mb-0">Estado da Reparação</h5>
                </div>

                {/* Timeline com pontos indicadores e linha de progresso */}
                <div
                  className="position-relative"
                  style={{ paddingBottom: "20px" }}
                >
                  {/* Pontos das fases do processo */}
                  <div className="d-flex justify-content-between mb-4 position-relative">
                    {statusPhases.map((phase, index) => {
                      const isActive = index <= currentPhaseIndex;
                      const isCurrent = index === currentPhaseIndex;

                      return (
                        <div
                          key={phase.key}
                          className="d-flex flex-column align-items-center"
                          style={{ flex: 1, zIndex: 10, position: "relative" }}
                        >
                          {/* Ponto indicador da fase */}
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${
                              isCurrent
                                ? "border border-3 border-primary bg-primary shadow"
                                : isActive
                                ? "border border-3 border-success bg-success"
                                : statusLower === "canceled"
                                ? "border border-3 border-danger bg-danger"
                                : "border border-3 border-secondary bg-light"
                            }`}
                            style={{ width: "40px", height: "40px" }}
                          >
                            <i
                              className={`bi bi-check-circle-fill ${
                                isActive || statusLower === "canceled"
                                  ? "text-white"
                                  : "text-muted"
                              }`}
                              style={{ fontSize: "20px" }}
                            ></i>
                          </div>
                          {/* Rótulo da fase */}
                          <p
                            className={`small mt-2 text-center ${
                              isActive ? "fw-semibold text-dark" : "text-muted"
                            }`}
                            style={{ maxWidth: "80px", fontSize: "11px" }}
                          >
                            {phase.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Linha de conexão entre as fases com barra de progresso */}
                  <div
                    className="position-absolute bg-secondary"
                    style={{
                      top: "20px",
                      left: "calc(10% + 20px)",
                      right: "calc(10% + 20px)",
                      height: "4px",
                      zIndex: 0,
                    }}
                  >
                    <div
                      className={`${barColor} transition-all`}
                      style={{
                        width: `${progressValue}%`,
                        height: "100%",
                        transition: "width 0.5s ease-in-out",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do modal com botão de fecho */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop escuro atrás do modal */}
      {open && (
        <div
          className="modal-backdrop fade show"
          onClick={() => onOpenChange(false)}
        ></div>
      )}
    </>
  );
}
