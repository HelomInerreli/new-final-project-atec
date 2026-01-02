import { useEffect, useState } from "react";
import { getServices } from "../services/ServiceHistoryServices";
import type { Appointment } from "../interfaces/appointment";
import { AppointmentStatusModal } from './AppointmentDetailsModal';
import "../i18n";
import { useTranslation } from "react-i18next";

/**
 * Componente para exibir histórico de serviços concluídos
 * Lista todos os agendamentos com status "concluído" (id 3)
 * Permite visualizar detalhes de cada serviço através de modal
 * Ordena agendamentos por ID de forma crescente
 * @returns Componente JSX da página de histórico de serviços
 */
export function ServiceHistory() {
/**
 * Hook de tradução para internacionalização
 */
const { t } = useTranslation();

/**
 * Estado para lista de agendamentos concluídos
 * Tipo: Array de Appointment
 * Inicial: array vazio
 */
const [appointments, setAppointments] = useState<Appointment[]>([]);

/**
 * Estado de carregamento durante fetch dos dados
 * Tipo: boolean
 * Inicial: true
 */
const [loading, setLoading] = useState(true);

/**
 * Estado para mensagens de erro
 * Tipo: string | null
 * Inicial: null
 */
const [error, setError] = useState<string | null>(null);

/**
 * Estado para o agendamento selecionado para visualização
 * Tipo: Appointment | null
 * Inicial: null (nenhum selecionado)
 */
const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

/**
 * Estado para controlar visibilidade do modal de detalhes
 * Tipo: boolean
 * Inicial: false
 */
const [showModal, setShowModal] = useState(false);

/**
 * Efeito para carregar agendamentos concluídos ao montar o componente
 * Busca todos os serviços, filtra apenas os com status 3 (concluído)
 * Ordena os resultados por ID de forma crescente
 * Executa uma única vez no mount do componente
 */
useEffect(() => {
    /**
     * Função assíncrona para buscar agendamentos da API
     * Filtra apenas agendamentos com status id = 3 (concluído)
     * Atualiza estados de appointments, error e loading
     */
    const fetchAppointments = async () => {
    try {
        setLoading(true);
        const data = await getServices();
    
        
        const completedAppointments = data
            .filter((appointment: Appointment) => appointment.status?.id === 3)
            .sort((a: Appointment, b: Appointment) => a.id - b.id);
        
            setAppointments(completedAppointments);
            setError(null);
        } catch (err) {
            
            setError(t("errorLoadingServices"));
        } finally {
            setLoading(false);  
        }
    };

    fetchAppointments();
}, []);

/**
 * Formata string de data ISO para formato local legível
 * @param dateString - String de data em formato ISO
 * @returns Data formatada segundo locale do navegador
 */
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

/**
 * Abre o modal de detalhes para um agendamento específico
 * @param appointment - Agendamento a ser exibido no modal
 */
  const handleShowDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

/**
 * Fecha o modal de detalhes e limpa o agendamento selecionado
 */

  return (
    <>
      {/* Cabeçalho da página com título e descrição */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">
          {t("completedServicesHistory")}
        </h1>
        <p className="lead text-muted">
          {t("completedServicesDescription")}
        </p>
      </div>

      {/* Indicador de carregamento (spinner) */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}...</span>
          </div>
          <p className="mt-3 text-primary">{t("loadingServices")}...</p>
        </div>
      )}

      {/* Alerta de erro (exibido apenas se houver erro) */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Conteúdo principal: tabela de serviços concluídos */}
      {!loading && !error && (
        <>
          {/* Card com tabela de agendamentos */}
          <div className="card shadow-sm">
            {/* Cabeçalho do card com contador de serviços */}
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                {t("completedServices")} ({appointments.length})
              </h5>
            </div>
            {/* Tabela responsiva com lista de serviços concluídos */}
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                {/* Cabeçalho da tabela com colunas */}
                <thead className="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">{t("appointmentDate")}</th>
                    <th scope="col">{t("serviceType")}</th>
                    <th scope="col">{t("description")}</th>
                    <th scope="col">{t("Actions")}</th>
                  </tr>
                </thead>
                {/* Corpo da tabela com linhas de agendamentos ou estado vazio */}
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => {
                      return (
                        <tr key={appointment.id}>
                          <td className="fw-bold">{appointment.id}</td>
                          <td>{formatDate(appointment.appointment_date)}</td>
                          <td className="fw-bold text-primary">
                            {appointment.service?.name || appointment.service_name}
                          </td>
                          <td
                            className="text-muted small"
                            title={appointment.description}
                          >
                            {appointment.description && appointment.description.length > 40
                              ? `${appointment.description.substring(0, 40)}...`
                              : appointment.description || t("noDescription")}
                          </td>
                          
                          {/* Coluna de ações com botão de detalhes */}
                          <td>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleShowDetails(appointment)}
                              title={t("viewDetails")}
                            >
                              <i className="bi bi-eye me-1"></i>
                              {t("details")}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    /* Estado vazio quando não há serviços concluídos */
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        <i className="bi bi-journal-x display-1 d-block mb-3 text-muted"></i>
                        {t("noServicesFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerta de sucesso com contador de dados carregados */}
          <div className="alert alert-success mt-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>{t("apiConnected")}</strong> - {appointments.length} {t("serviceDataFetchedSuccessfully")}
          </div>
        </>
      )}

      {/* Modal de detalhes do agendamento */}
      <AppointmentStatusModal
  appointment={selectedAppointment}
  open={!!selectedAppointment}
  onOpenChange={(open: boolean) => !open && setSelectedAppointment(null)}
/>
    </>
  );
}
