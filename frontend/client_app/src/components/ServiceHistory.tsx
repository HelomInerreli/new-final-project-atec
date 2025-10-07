import { useEffect, useState } from "react";
import { getServices } from "../services/ServiceHistoryServices";
import type { Appointment } from "../interfaces/appointment";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";
import "../i18n";
import { useTranslation } from "react-i18next";

export function ServiceHistory() {
const { t } = useTranslation();
const [appointments, setAppointments] = useState<Appointment[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
const [showModal, setShowModal] = useState(false);

useEffect(() => {
    const fetchAppointments = async () => {
    try {
        setLoading(true);
        const data = await getServices();
    
        // Filter only FINALIZED appointments (status.id === 3)
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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

  const getBudgetVariance = (estimated: number, actual: number) => {
    const variance = actual - estimated;
    if (variance === 0) return { text: t("completed"), class: "text-success" };
    if (variance > 0)
      return { text: `+€${Math.round(variance)}`, class: "text-danger" };
    return {
      text: `-€${Math.round(Math.abs(variance))}`,
      class: "text-success",
    };
  };

  const handleShowDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  return (
    <>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">
          {t("completedServicesHistory")}
        </h1>
        <p className="lead text-muted">
          {t("completedServicesDescription")}
        </p>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}...</span>
          </div>
          <p className="mt-3 text-primary">{t("loadingServices")}...</p>
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
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                {t("completedServices")} ({appointments.length})
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">{t("appointmentDate")}</th>
                    <th scope="col">{t("serviceType")}</th>
                    <th scope="col">{t("description")}</th>
                    <th scope="col">{t("estimatedBudget")}</th>
                    <th scope="col">{t("actualBudget")}</th>
                    <th scope="col">{t("variance")}</th>
                    <th scope="col">{t("status")}</th>
                    <th scope="col">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => {
                      const variance = getBudgetVariance(
                        appointment.estimated_budget,
                        appointment.actual_budget
                      );
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
                            {appointment.description.length > 40
                              ? `${appointment.description.substring(0, 40)}...`
                              : appointment.description || t("noDescription")}
                          </td>
                          <td className="fw-bold text-info">
                            €{Math.round(appointment.estimated_budget)}
                          </td>
                          <td className="fw-bold">
                            €{Math.round(appointment.actual_budget)}
                          </td>
                          <td className={variance.class}>
                            <small className="fw-bold">{variance.text}</small>
                          </td>
                          <td>
                            <span className="badge bg-success">
                              {appointment.status?.name || t("completed")}
                            </span>
                          </td>
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

          <div className="alert alert-success mt-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>{t("apiConnected")}</strong> - {appointments.length} {t("serviceDataFetchedSuccessfully")}
          </div>
        </>
      )}

      {/* Modal Component */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        show={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
}
