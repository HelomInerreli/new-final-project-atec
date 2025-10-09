import { useEffect, useState } from "react";
import { getCustomerAppointments } from "../services/customerService";
import '../i18n';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

interface Appointment {
  id: number;
  appointment_date: string;
  description: string | null;
  estimated_budget: number;
  actual_budget: number;
  service_id: number;
  status:{
    id: number;
    name: string;
  }
}

export function AppointmentList() {
  console.log("Renderizando AppointmentList component");
  const { t } = useTranslation();
  const { customerId } = useParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // ← SIMULAÇÃO DE CLIENTE LOGADO (mude este valor para testar diferentes clientes)
  const [loggedInCustomerId] = useState(1); // ← Cliente 1 logado
  const [userRole] = useState<'customer' | 'admin'>('customer'); // ← ou 'admin'

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        console.log("Tentando buscar agendamentos...");
        
        let customerIdToUse: number;
        
        if (userRole === 'admin') {
          // Admin pode ver qualquer cliente
          customerIdToUse = customerId ? parseInt(customerId) : loggedInCustomerId;
          console.log("Admin acessando cliente:", customerIdToUse);
        } else {
          // Cliente só pode ver seus próprios appointments
          if (customerId && parseInt(customerId) !== loggedInCustomerId) {
            setError(`❌ Acesso Negado! Você só pode ver seus próprios agendamentos. (Você é o cliente ${loggedInCustomerId})`);
            setLoading(false);
            return;
          }
          customerIdToUse = loggedInCustomerId;
          console.log(`Cliente ${loggedInCustomerId} acessando seus próprios agendamentos`);
        }
        
        console.log("Customer ID usado:", customerIdToUse);
        
        const data = await getCustomerAppointments(customerIdToUse);
        console.log("Dados recebidos:", data);
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error("Erro detalhado:", err);
        setError(t('errorLoadingAppointments'));
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [mounted, t, customerId, loggedInCustomerId, userRole]); // ← Fechamento correto do useEffect

  if (!mounted) {
    return <div>Loading...</div>;
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
        
        {/* ← INFO DO USUÁRIO SIMULADO */}
        <div className="alert alert-info">
          <strong>Simulação:</strong> {userRole === 'admin' ? 'Admin' : `Cliente ${loggedInCustomerId}`} logado
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




