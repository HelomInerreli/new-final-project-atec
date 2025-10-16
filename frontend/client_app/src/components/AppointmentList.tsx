import { useEffect, useState } from "react";
import { getCustomerAppointments } from "../services/customerService";
import '../i18n';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAuth } from '../api/auth';

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

export function AppointmentList() {
  const { t } = useTranslation();
  const { customerId } = useParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Usa o sistema de autenticação real
  const { loggedInCustomerId, isLoggedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn || loggedInCustomerId == null) {
    return (
      <div className="alert alert-warning text-center my-5">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Por favor, faça login para ver os seus agendamentos.
      </div>
    );
  }

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
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">{t('appointmentList')}</h1>
        <div className="alert alert-info">
          <strong>Utilizador:</strong> Cliente {loggedInCustomerId} logado
        </div>
        <p className="lead text-muted">
          {t('appointmentManagementDescription')}
        </p>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}...</span>
          </div>
          <p className="mt-3 text-primary">{t('loadingAppointments')}...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-check me-2"></i>
                {t('registeredAppointments')} ({appointments.length})
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
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

          <div className="alert alert-success mt-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>{t('apiConnected')}</strong> - {t('appointmentDataFetchedSuccessfully')}
          </div>
        </>
      )}
    </>
  );
}