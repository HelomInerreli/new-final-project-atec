import { useEffect } from 'react';
import type { AppointmentStatusModalProps, Appointment } from '../interfaces/appointment';
import '../styles/modal.css';

// Fases de status baseadas no banco de dados (ordem de progressão)
const statusPhases = [
  { key: "pendente", label: "Pendente" },
  { key: "awaiting approval", label: "Aguardando Aprovação" },
  { key: "in repair", label: "Em Reparação" },
  { key: "waitting payment", label: "Aguardando Pagamento" },
  { key: "finalized", label: "Finalizado" },
];

// Função para calcular o progresso baseado no status
const getProgressValue = (status: string): number => {
  const statusLower = status?.toLowerCase();
  
  // Se for "canceled", retorna 0% (não progride)
  if (statusLower === "canceled") return 0;
  
  const currentIndex = statusPhases.findIndex(phase => phase.key === statusLower);
  
  if (currentIndex === -1) return 0;  // Status desconhecido
  
  // Calcula porcentagem baseado no índice
  return ((currentIndex + 1) / statusPhases.length) * 100;
};

// Função para o badge de status
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

export function AppointmentStatusModal({ appointment, open, onOpenChange }: AppointmentStatusModalProps) {
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [open]);

  if (!appointment) return null;

  const statusLower = appointment.status?.name?.toLowerCase();
  const progressValue = getProgressValue(appointment.status?.name || "");
  const currentPhaseIndex = statusPhases.findIndex(
    (phase) => phase.key === statusLower
  );

  // Cor da barra: vermelha para canceled, verde para finalized, azul para outros
  const barColor = statusLower === "canceled" 
    ? "bg-danger" 
    : statusLower === "finalized" 
    ? "bg-success" 
    : "bg-primary";

  return (
    <>
      <div className={`modal fade ${open ? 'show' : ''}`} style={{ display: open ? 'block' : 'none' }} tabIndex={-1} onClick={() => onOpenChange(false)}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-calendar-event me-2"></i>
                {appointment.service?.name || 'Detalhes do Agendamento'}
              </h5>
              <button type="button" className="btn-close" onClick={() => onOpenChange(false)}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 text-end">
                {getStatusBadge(appointment.status)}
              </div>

              {/* Detalhes do Agendamento */}
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-calendar me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">Data do Agendamento</p>
                    <p className="fw-semibold">{appointment.appointment_date || appointment.date}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-muted text-uppercase small mb-1">Descrição</p>
                  <p>{appointment.description}</p>
                </div>

                <div className="d-flex align-items-start">
                  <i className="bi bi-currency-euro me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">Orçamento Estimado</p>
                    <p className="fw-semibold">€{appointment.estimated_budget?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Veículo e Serviço */}
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-car-front me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">Veículo</p>
                    <p className="fw-semibold">{appointment.vehicle?.brand} {appointment.vehicle?.model} - {appointment.vehicle?.plate}</p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <i className="bi bi-tools me-3 mt-1 text-primary"></i>
                  <div>
                    <p className="text-muted text-uppercase small mb-1">Serviço</p>
                    <p className="fw-semibold">{appointment.service?.name}</p>
                    {appointment.service?.description && <p className="text-muted small">{appointment.service.description}</p>}
                  </div>
                </div>
              </div>

              {/* Estado da Reparação */}
              <div className="border-top pt-4">
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-clock me-2 text-primary"></i>
                  <h5 className="fw-semibold mb-0">Estado da Reparação</h5>
                </div>

                {/* Timeline com pontos e linha */}
                <div className="position-relative" style={{ paddingBottom: '20px' }}>
                  <div className="d-flex justify-content-between mb-4 position-relative">
                    {statusPhases.map((phase, index) => {
                      const isActive = index <= currentPhaseIndex;
                      const isCurrent = index === currentPhaseIndex;

                      return (
                        <div key={phase.key} className="d-flex flex-column align-items-center" style={{ flex: 1, zIndex: 10, position: 'relative' }}>
                          {/* Ponto */}
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${
                              isCurrent
                                ? 'border border-3 border-primary bg-primary shadow'
                                : isActive
                                ? 'border border-3 border-success bg-success'
                                : statusLower === "canceled"
                                ? 'border border-3 border-danger bg-danger'
                                : 'border border-3 border-secondary bg-light'
                            }`}
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i className={`bi bi-check-circle-fill ${isActive || statusLower === "canceled" ? 'text-white' : 'text-muted'}`} style={{ fontSize: '20px' }}></i>
                          </div>
                          {/* Rótulo */}
                          <p className={`small mt-2 text-center ${isActive ? 'fw-semibold text-dark' : 'text-muted'}`} style={{ maxWidth: '80px', fontSize: '11px' }}>
                            {phase.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Linha de conexão */}
                  <div 
                    className="position-absolute bg-secondary" 
                    style={{ 
                      top: '20px', 
                      left: 'calc(10% + 20px)', 
                      right: 'calc(10% + 20px)', 
                      height: '4px', 
                      zIndex: 0 
                    }}
                  >
                    <div
                      className={`${barColor} transition-all`}
                      style={{ 
                        width: `${progressValue}%`, 
                        height: '100%',
                        transition: 'width 0.5s ease-in-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => onOpenChange(false)}>Fechar</button>
            </div>
          </div>
        </div>
      </div>
      {open && <div className="modal-backdrop fade show" onClick={() => onOpenChange(false)}></div>}
    </>
  );
}