import { useEffect, useState } from "react";
import { getCustomerAppointments } from "../services/customerService";
import '../i18n';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAuth } from '../api/auth';

/**
 * Interface para representar um agendamento
 * Contém todas as informações necessárias de um agendamento
 */
interface Appointment {
  id: number;
  appointment_date: string;
  description: string | null;
  estimated_budget: number;
  actual_budget: number;
  service_id: number;
  status: {
    id: number;
    name: string;
  }
}



/**
 * Componente para listar todos os agendamentos de um cliente
 * Exibe uma tabela com os agendamentos e valida permissões de acesso
 * @returns Componente JSX com a lista de agendamentos ou mensagens de estado
 */
export function AppointmentList() {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Parâmetro de rota com o ID do cliente
   */
  const { customerId } = useParams();

  /**
   * Estado para armazenar a lista de agendamentos do cliente
   * Tipo: Array de Appointment
   * Inicia como array vazio
   */
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  /**
   * Estado para indicar se os dados estão sendo carregados
   * Tipo: boolean
   * Inicia como true
   */
  const [loading, setLoading] = useState(true);

  /**
   * Estado para armazenar mensagens de erro
   * Tipo: string | null
   * Inicia como null (sem erro)
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Estado para indicar se o componente foi montado
   * Tipo: boolean
   * Usado para evitar execução de efeitos antes da montagem completa
   */
  const [mounted, setMounted] = useState(false);

  /**
   * Hook de autenticação
   * loggedInCustomerId - ID do cliente autenticado
   * isLoggedIn - Estado de autenticação do utilizador
   */
  const { loggedInCustomerId, isLoggedIn } = useAuth();

  /**
   * Efeito para marcar o componente como montado
   * Executa apenas uma vez ao montar
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Efeito para carregar os agendamentos do cliente
   * Valida autenticação e permissões antes de buscar os dados
   * Cliente só pode ver os próprios agendamentos
   * Executa quando o componente é montado ou quando dependências mudam
   */
  useEffect(() => {
    if (!mounted) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);

        // Garante que o utilizador está autenticado e tem ID válido
        if (!isLoggedIn || loggedInCustomerId == null) {
          setError("Por favor, faça login para ver os seus agendamentos.");
          setLoading(false);
          return;
        }

        let customerIdToUse: number;

        // Cliente só pode ver os próprios appointments
        if (customerId && parseInt(customerId) !== loggedInCustomerId) {
          setError(` Acesso Negado! Você só pode ver seus próprios agendamentos. (Você é o cliente ${loggedInCustomerId})`);
          setLoading(false);
          return;
        }
        customerIdToUse = loggedInCustomerId;

        const data = await getCustomerAppointments(customerIdToUse);
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(t('errorLoadingAppointments'));
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [mounted, t, customerId, loggedInCustomerId, isLoggedIn]);

  /**
   * Retorna mensagem de loading enquanto o componente não está completamente montado
   */
  if (!mounted) {
    return <div>Loading...</div>;
  }

  /**
   * Retorna alerta se o utilizador não estiver autenticado
   * Solicita login para visualizar agendamentos
   */
  if (!isLoggedIn || loggedInCustomerId == null) {
    return (
      <div className="alert alert-warning text-center my-5">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Por favor, faça login para ver os seus agendamentos.
      </div>
    );
  }

  /**
   * Função para determinar a cor do badge baseado no status
   * Retorna classe Bootstrap apropriada para cada tipo de status
   * @param status - Status do agendamento (string ou objeto)
   * @returns Nome da classe de cor Bootstrap (success, warning, danger, secondary)
   */
  const getStatusColor = (status: string | any): string => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case "confirmed": return "success";
      case "pending": return "warning";
      case "cancelled": return "danger";
      default: return "secondary";
    }
  };

  return (
    <>
      {/* Cabeçalho da página com título, info do utilizador e descrição */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">{t('appointmentList')}</h1>
        <div className="alert alert-info">
          <strong>Utilizador:</strong> Cliente {loggedInCustomerId} logado
        </div>
        <p className="lead text-muted">
          {t('appointmentManagementDescription')}
        </p>
      </div>

      {/* Indicador de carregamento */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}...</span>
          </div>
          <p className="mt-3 text-primary">{t('loadingAppointments')}...</p>
        </div>
      )}

      {/* Alerta de erro, exibido apenas se houver erro */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Tabela de agendamentos - exibida apenas quando carregamento termina sem erros */}
      {!loading && !error && (
        <>
          <div className="card shadow-sm">
            {/* Cabeçalho do cartão com contador de agendamentos */}
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-check me-2"></i>
                {t('registeredAppointments')} ({appointments.length})
              </h5>
            </div>

            {/* Tabela responsiva com dados dos agendamentos */}
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                {/* Cabeçalho da tabela */}
                <thead className="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">{t('date')}</th>
                    <th scope="col">{t('description')}</th>
                    <th scope="col">Service ID</th>
                    <th scope="col">Status</th>
                    <th scope="col">Estimated Budget</th>
                    <th scope="col">Actual Budget</th>
                  </tr>
                </thead>

                {/* Corpo da tabela com lista de agendamentos ou mensagem de lista vazia */}
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="fw-bold">{appointment.id}</td>
                        <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                        <td className="text-muted small">{appointment.description || "-"}</td>
                        <td>{appointment.service_id}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(appointment.status?.name || '')}`}>
                            {appointment.status?.name || 'N/A'}
                          </span>
                        </td>
                        <td>€{appointment.estimated_budget}</td>
                        <td>€{appointment.actual_budget}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        <i className="bi bi-calendar-x display-1 d-block mb-3 text-muted"></i>
                        {t('noAppointmentsFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerta de sucesso confirmando conexão com API */}
          <div className="alert alert-success mt-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>{t('apiConnected')}</strong> - {t('appointmentDataFetchedSuccessfully')}
          </div>
        </>
      )}
    </>
  );
}