import { useTranslation } from "react-i18next";
import type { Appointment } from "../interfaces/appointment";

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  show: boolean;
  onClose: () => void;
}

export function AppointmentDetailsModal({ 
  appointment, 
  show, 
  onClose 
}: AppointmentDetailsModalProps) {
  const { t } = useTranslation();

  if (!show || !appointment) return null;

  // Debug: mostrar extra_services no console
  console.log("Appointment extra_services:", appointment.extra_services);
  console.log("Full appointment object:", appointment);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-calendar-check me-2"></i>
              {t("appointmentDetails")} - ID: {appointment.id}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      {t("generalInfo")}
                    </h6>
                  </div>
                  <div className="card-body">
                    <p><strong>{t("appointmentDate")}:</strong><br />
                      {formatDateTime(appointment.appointment_date)}
                    </p>
                    <p><strong>{t("status")}:</strong><br />
                      <span className="badge bg-success">
                        {appointment.status?.name || t("completed")}
                      </span>
                    </p>
                    <p><strong>{t("reminder")}:</strong><br />
                      <span className={`badge ${appointment.reminder_sent ? 'bg-success' : 'bg-secondary'}`}>
                        {appointment.reminder_sent ? t("sent") : t("notSent")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-wrench me-2"></i>
                      {t("serviceInfo")}
                    </h6>
                  </div>
                  <div className="card-body">
                    <p><strong>{t("serviceType")}:</strong><br />
                      {appointment.service?.name || appointment.service_name}
                    </p>
                    {appointment.service?.duration_minutes && (
                      <p><strong>{t("duration")}:</strong><br />
                        {appointment.service.duration_minutes} {t("minutes")}
                      </p>
                    )}
                    <p><strong>{t("serviceDescription")}:</strong><br />
                      <span className="text-muted">
                        {appointment.service?.description || t("noDescription")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12 mb-3">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-currency-euro me-2"></i>
                      {t("budgetInfo")}
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <p><strong>{t("estimatedBudget")}:</strong><br />
                          <span className="fs-5 text-info">€{Math.round(appointment.estimated_budget)}</span>
                        </p>
                      </div>
                      <div className="col-md-4">
                        <p><strong>{t("actualBudget")}:</strong><br />
                          <span className="fs-5 text-primary">€{Math.round(appointment.actual_budget)}</span>
                        </p>
                      </div>
                      <div className="col-md-4">
                        {(() => {
                          const variance = getBudgetVariance(appointment.estimated_budget, appointment.actual_budget);
                          return (
                            <p><strong>{t("variance")}:</strong><br />
                              <span className={`fs-5 ${variance.class}`}>{variance.text}</span>
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-chat-text me-2"></i>
                      {t("appointmentDescription")}
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">
                      {appointment.description || t("noDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-plus-circle me-2"></i>
                      {t("extraServices")}
                      {appointment.extra_services && appointment.extra_services.length > 0 && (
                        <span className="badge bg-primary ms-2">
                          {appointment.extra_services.length}
                        </span>
                      )}
                    </h6>
                  </div>
                  <div className="card-body">
                    {appointment.extra_services && appointment.extra_services.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-striped">
                          <thead>
                            <tr>
                              <th style={{ width: '70%' }}>{t("description")}</th>
                              <th style={{ width: '30%' }}>{t("cost")}</th>  
                              
                            </tr>
                          </thead>
                          <tbody>
                            {appointment.extra_services.map((service, index) => (
                              <tr key={index}>
                                <td>
                                  <i className="bi bi-gear me-2 text-primary"></i>
                                  {service.description}
                                </td>
                                <td className="fw-bold text-success">
                                  €{Math.round(service.cost)}
                                </td>
                              
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="table-info">
                              <td><strong>{t("totalExtraServices")}:</strong></td>
                              <td><strong>
                                €{Math.round(appointment.extra_services.reduce((total, service) => total + service.cost, 0))}
                              </strong></td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-4 d-block mb-2 text-muted"></i>
                        <p className="mb-0">{t("noExtraServices")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i>
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}