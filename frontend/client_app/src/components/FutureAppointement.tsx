import { useEffect, useState } from "react";
import { getServices } from "../services/ServiceHistoryServices";
import type { Appointment } from "../interfaces/appointment";
import "../i18n";
import { useTranslation } from "react-i18next";

export function FutureAppointments() {
const { t } = useTranslation();
const [appointments, setAppointments] = useState<Appointment[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchAppointments = async () => {
    try {
        setLoading(true);
        const data = await getServices();

        const completedAppointments = data
        .filter((appointment: Appointment) => appointment.status?.id === 1)
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

return (
    <>
    <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">
        {t("completedServicesHistory")}
        </h1>
        <p className="lead text-muted">{t("completedServicesDescription")}</p>
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
                    <th scope="col">{t("Actions")}</th>
                </tr>
                </thead>
                <tbody>
                {appointments.length > 0 ? (
                    appointments.map((appointment) => {
                    return (
                        <tr key={appointment.id}>
                        <td className="fw-bold">{appointment.id}</td>
                        <td>{formatDate(appointment.appointment_date)}</td>
                        <td className="fw-bold text-primary">
                            {appointment.service?.name ||
                            appointment.service_name}
                        </td>
                        <td
                            className="text-muted small"
                            title={appointment.description}
                        >
                            {appointment.description.length > 40
                            ? `${appointment.description.substring(0, 40)}...`
                            : appointment.description || t("noDescription")}
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
            <strong>{t("apiConnected")}</strong> - {appointments.length}{" "}
            {t("serviceDataFetchedSuccessfully")}
        </div>
        </>
    )}
    </>
);
}
