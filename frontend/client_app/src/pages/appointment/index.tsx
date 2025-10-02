import { useEffect, useState } from "react";
import { getCustomerAppointments } from "../../services/customerService";

interface Appointment {
  id: number;
  service_name: string;
  service_date: string;
  description: string | null;
  status: string;
}

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getCustomerAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError("Falha ao buscar os agendamentos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="container">
      <h1 className="text-center mt-5 title">
        Lista de Agendamentos
      </h1>
      {loading && <p>A carregar...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <table className="table table-striped mt-4">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Serviço</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Status</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.service_name}</td>
                <td>{new Date(appointment.service_date).toLocaleDateString()}</td>
                <td>{new Date(appointment.service_date).toLocaleTimeString()}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>{appointment.description || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">Nenhum agendamento encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

export default Appointments;