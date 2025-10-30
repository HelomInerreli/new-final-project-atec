import React, { useMemo, useState, useEffect } from "react";
import "../appointments.css";
import "../NewAppointment.css";
import NewAppointment from "./NewAppointment";

type ViewType = "day" | "week" | "month";

interface CalendarEvent {
  id: string;
  day: string;         // "Seg" | "Ter" | ...
  start: string;       // "HH:mm"
  end: string;         // "HH:mm"
  title: string;
  color: "green" | "yellow";
  client: {
    name: string;
    car: { make: string; model: string; year: number; plate: string };
  };
  service: { type: string; description: string; estimatedDuration: string };
}

// Dados do formulário que vêm do NewAppointment
interface AppointmentFormData {
  clientName: string;
  carMake: string;
  carModel: string;
  carYear: number;
  carPlate: string;
  serviceType: string;
  serviceDescription: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}

const daysMonFirst = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9h to 19h

const START_HOUR = 9;
const HOUR_HEIGHT = 50;
const PX_PER_MINUTE = HOUR_HEIGHT / 60;

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  date.setDate(date.getDate() - diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function getPtDayLabel(date: Date) {
  const map = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return map[date.getDay()];
}

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <h2>{event.title}</h2>

        <div className="modal-section">
          <h3>Horário</h3>
          <p>
            {event.start} - {event.end}
          </p>
          <p>Duração estimada: {event.service.estimatedDuration}</p>
        </div>

        <div className="modal-section">
          <h3>Cliente</h3>
          <p>{event.client.name}</p>
        </div>

        <div className="modal-section">
          <h3>Veículo</h3>
          <p>
            {event.client.car.make} {event.client.car.model} (
            {event.client.car.year})
          </p>
          <p>Matrícula: {event.client.car.plate}</p>
        </div>

        <div className="modal-section">
          <h3>Serviço</h3>
          <p>
            <strong>{event.service.type}</strong>
          </p>
          <p>{event.service.description}</p>
        </div>
      </div>
    </div>
  );
};

const Appointments: React.FC = () => {
  const [view, setView] = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/appointments");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleAddAppointment = () => {
    setIsAddingAppointment(true);
  };

  const visibleDays = useMemo(() => {
    if (view === "day") {
      const d = new Date(currentDate);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
      if (d.getDay() === 6) d.setDate(d.getDate() + 2);
      return [d];
    }
    if (view === "week") {
      const start = startOfWeekMonday(currentDate);
      return Array.from({ length: 5 }, (_, i) => addDays(start, i));
    }
    return [];
  }, [view, currentDate]);

  const monthMatrix = useMemo(() => {
    if (view !== "month") return [];
    const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const start = startOfWeekMonday(firstOfMonth);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [view, currentDate]);

  function navigateCalendar(direction: number) {
    const d = new Date(currentDate);
    if (view === "day") {
      let increment = direction;
      if (direction > 0 && d.getDay() === 5) increment = 3;
      if (direction < 0 && d.getDay() === 1) increment = -3;
      d.setDate(d.getDate() + increment);
    } else if (view === "week") d.setDate(d.getDate() + direction * 7);
    else d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
  }

  const periodLabel = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions =
      view === "month"
        ? { month: "long", year: "numeric" }
        : { day: "2-digit", month: "long", year: "numeric" };
    return currentDate.toLocaleDateString("pt-PT", opts);
  }, [currentDate, view]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  const handleNewAppointment = (formData: AppointmentFormData) => {
    const newEvent: CalendarEvent = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      day: new Date(formData.date).toLocaleDateString('pt-PT', { weekday: 'short' }),
      start: formData.startTime,
      end: formData.endTime,
      title: `${formData.serviceType} - ${formData.clientName}`,
      color: "green",
      client: {
        name: formData.clientName,
        car: {
          make: formData.carMake,
          model: formData.carModel,
          year: formData.carYear,
          plate: formData.carPlate
        }
      },
      service: {
        type: formData.serviceType,
        description: formData.serviceDescription,
        estimatedDuration: "1h" // You might want to calculate this based on start and end time
      }
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsAddingAppointment(false);
  };

  return (
    <div className={`calendar-wrapper ${view === "month" ? "view-month" : ""}`}>
      <div className="calendar-controls">
        <button onClick={() => setCurrentDate(new Date())}>Hoje</button>
        <button onClick={() => navigateCalendar(-1)}>Anterior</button>
        <select value={view} onChange={(e) => setView(e.target.value as ViewType)}>
          <option value="day">Dia</option>
          <option value="week">Semana</option>
          <option value="month">Mês</option>
        </select>
        <button onClick={() => navigateCalendar(1)}>Seguinte</button>
        <span className="current-date">{periodLabel}</span>

        {/* ✅ Botão que abre o modal com o NewAppointment */}
        <button className="add-appointment-btn" onClick={handleAddAppointment}>
          + Novo Agendamento
        </button>
      </div>

      {view === "month" ? (
        <>
          <div className="calendar-header month">
            {daysMonFirst.map((d) => (
              <div key={d} className="day-header">
                <div className="day-name">{d}</div>
              </div>
            ))}
          </div>
          <div className="month-grid">
            {monthMatrix.map((date, idx) => {
              const isOutside = date.getMonth() !== currentDate.getMonth();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const dayLabel = getPtDayLabel(date);
              const count = events.filter((e) => e.day === dayLabel).length;

              const cellClasses = [
                "month-cell",
                isOutside ? "outside" : "",
                isWeekend ? "weekend" : "",
              ]
                .join(" ")
                .trim();

              return (
                <div
                  key={idx}
                  className={cellClasses}
                  onClick={() => !isWeekend && handleDayClick(date)}
                  style={{ cursor: isWeekend ? "default" : "pointer" }}
                >
                  <div className="month-date">{date.getDate()}</div>
                  {count > 0 && <div className="month-badge">{count}</div>}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="calendar-header">
            <div className="hour-col-header"></div>
            {visibleDays.map((date) => (
              <div key={date.toDateString()} className="day-header">
                <div className="day-name">
                  {getPtDayLabel(date)} {date.getDate().toString().padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>

          <div className="calendar-body">
            <div className="hours-col">
              {hours.map((h) => (
                <div key={h} className="hour-cell">{`${h.toString().padStart(2, "0")}:00`}</div>
              ))}
            </div>

            <div
              className="days-grid"
              style={{ gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)` }}
            >
              {visibleDays.map((date) => {
                const label = getPtDayLabel(date);
                return (
                  <div key={date.toISOString()} className="day-column">
                    {hours.map((_, i) => (
                      <div key={i} className="day-cell" />
                    ))}
                    {events
                      .filter((e) => e.day === label)
                      .map((e) => {
                        const startMin = timeToMinutes(e.start) - START_HOUR * 60;
                        const endMin = timeToMinutes(e.end) - START_HOUR * 60;
                        const top = startMin * PX_PER_MINUTE;
                        const height = (endMin - startMin) * PX_PER_MINUTE;

                        return (
                          <div
                            key={e.id}
                            className={`event-block ${e.color}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`${e.title}\n${e.start} - ${e.end}`}
                            onClick={() => handleEventClick(e)}
                          >
                            <div className="event-time">
                              {e.start} - {e.end}
                            </div>
                            <div className="event-title">{e.title}</div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal para detalhes de evento */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* ✅ Modal para adicionar novo agendamento */}
      {isAddingAppointment && (
  <div className="event-modal-overlay" onClick={() => setIsAddingAppointment(false)}>
    <div className="event-modal large" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={() => setIsAddingAppointment(false)}>
        &times;
      </button>

      <NewAppointment
        isOpen={true}
        onClose={() => setIsAddingAppointment(false)}
        onSubmit={handleNewAppointment}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default Appointments;
