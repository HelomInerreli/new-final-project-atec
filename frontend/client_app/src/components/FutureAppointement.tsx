import { useEffect, useState } from "react";
import { getServices } from "../services/ServiceHistoryServices";
import type { Appointment } from "../interfaces/appointment";
import { useAuth } from "../api/auth";
import { FaCalendarAlt, FaCheckCircle, FaTools } from 'react-icons/fa';
import "../i18n";
import { useTranslation } from "react-i18next";
import "../styles/FutureAppointments.css";

export function FutureAppointments() {
    const { t } = useTranslation();
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!isLoggedIn || !loggedInCustomerId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getServices();

                const completedAppointments = data
                    .filter((appointment: Appointment) => {
                        const matchStatus = appointment.status?.id === 1;
                        const matchCustomer =
                            appointment.customer_id === loggedInCustomerId ||
                            appointment.customer_id === Number(loggedInCustomerId) ||
                            String(appointment.customer_id) === String(loggedInCustomerId);

                        return matchStatus && matchCustomer;
                    })
                    .sort((a: Appointment, b: Appointment) =>
                        new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
                    );

                setAppointments(completedAppointments);
                setError(null);
            } catch (err) {
                setError(t("errorLoadingServices"));
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [isLoggedIn, loggedInCustomerId, t]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="appointments-page">
                <div className="alert alert-warning">
                    {t("pleaseLogin")}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="appointments-page">
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t("loading")}...</span>
                    </div>
                    <p className="mt-3 text-primary">{t("loadingServices")}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-page">
            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {!error && appointments.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <FaCalendarAlt size={80} />
                    </div>
                    <h3>{t("noServicesFound")}</h3>
                    <p>{t("noAppointmentsDescription")}</p>
                </div>
            )}

            {!error && appointments.length > 0 && (
                <div className="appointments-grid">
                    {appointments.map((appointment) => (
                        <div key={appointment.id} className="appointment-card">
                            <div className="appointment-card-header">
                                <div className="appointment-icon">
                                    <FaCheckCircle size={32} />
                                </div>
                                <div className="appointment-status">
                                    <span className="status-badge status-completed">
                                        {t("completed")}
                                    </span>
                                </div>
                            </div>

                            <div className="appointment-card-body">
                                <h3 className="appointment-service">
                                    <FaTools className="me-2" />
                                    {appointment.service?.name || appointment.service_name}
                                </h3>

                                <div className="appointment-info">
                                    <div className="info-item">
                                        <FaCalendarAlt className="info-icon" />
                                        <div>
                                            <span className="info-label">{t("appointmentDate")}</span>
                                            <span className="info-value">{formatDate(appointment.appointment_date)}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">{t("description")}</span>
                                        <p className="info-description">
                                            {appointment.description || t("noDescription")}
                                        </p>
                                    </div>

                                    {(appointment.estimated_budget || appointment.actual_budget) && (
                                        <div className="appointment-budget">
                                            {appointment.estimated_budget && (
                                                <div className="budget-item">
                                                    <span className="budget-label">{t("estimatedBudget")}</span>
                                                    <span className="budget-value text-muted">€{appointment.estimated_budget.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
