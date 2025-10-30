import React, { useState } from "react";


export interface AppointmentFormData {
  clientName: string;
  carMake: string;
  carModel: string;
  carYear: number;
  carPlate: string;
  serviceType: string;
  serviceDescription: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

interface Service {
  id: string;
  name: string;
  icon: string;
}

interface NewAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

const NewAppointment: React.FC<NewAppointmentProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dados do cliente (novos campos incluídos)
  const [client, setClient] = useState({
    matricula: "",
    nome: "",
    apelido: "",
    email: "",
    telefone: "",
    nif: "",
    dataNascimento: "",
    morada: "",
    codigoPostal: "",
    localidade: "",
  });

  const servicesList: Service[] = [
    { id: "rev", name: "Revisão Oficial", icon: "bi bi-wrench" },
    { id: "insp", name: "Inspeção Obrigatória", icon: "bi bi-clipboard-check" },
    { id: "check", name: "Check-up", icon: "bi bi-tools" },
    { id: "lamp", name: "Lâmpadas", icon: "bi bi-lightbulb" },
    { id: "oleo", name: "Mudança de Óleo", icon: "bi bi-droplet" },
    { id: "trav", name: "Travões", icon: "bi bi-disc" },
    { id: "ar", name: "Ar Condicionado", icon: "bi bi-snow" },
    { id: "pneus", name: "Pneus", icon: "bi bi-circle-half" },
    { id: "diag", name: "Diagnóstico Electrónico", icon: "bi bi-cpu" },
    { id: "bat", name: "Baterias Auto", icon: "bi bi-battery-half" },
    { id: "amort", name: "Amortecedores", icon: "bi bi-tools" },
    { id: "outros", name: "Outros", icon: "bi bi-question-circle" },
  ];

  const ServiceCard: React.FC<{
    service: Service;
    selected: boolean;
    onClick: () => void;
  }> = ({ service, selected, onClick }) => (
    <div
      onClick={onClick}
      className={`d-flex align-items-center justify-content-between border px-3 py-3 rounded-4 ${
        selected ? "border-2 border-danger bg-light" : "border-secondary-subtle"
      }`}
      style={{ cursor: "pointer", transition: "0.2s" }}
    >
      <div className="d-flex align-items-center gap-3">
        <input type="checkbox" checked={selected} readOnly />
        <i className={`${service.icon} fs-4 ${selected ? "text-danger" : "text-secondary"}`}></i>
        <span>{service.name}</span>
      </div>
    </div>
  );

  const SummaryPanel: React.FC<{
    selectedServices: string[];
    selectedDate?: Date | null;
    selectedTime?: string | null;
  }> = ({ selectedServices, selectedDate, selectedTime }) => (
    <div className="border rounded-4 p-3 bg-white">
      <h6 className="text-danger fw-bold mb-3">A minha Marcação</h6>
      <ul className="list-unstyled small text-muted mb-0">
        {selectedServices.map((id) => (
          <li key={id}>• {servicesList.find((s) => s.id === id)?.name}</li>
        ))}
      </ul>
      {selectedDate && selectedTime && (
        <>
          <hr />
          <p className="small text-muted mb-0">
            {selectedDate.toLocaleDateString("pt-PT")} às {selectedTime}
          </p>
        </>
      )}
    </div>
  );

  // Slots visíveis (ajuste conforme necessário)
  const hours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
  ];

  const generateWorkDays = (month: Date) => {
    const days: Date[] = [];
    const date = new Date(month.getFullYear(), month.getMonth(), 1);
    while (date.getMonth() === month.getMonth()) {
      if (date.getDay() >= 1 && date.getDay() <= 5) days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const workDays = generateWorkDays(currentMonth);
  const monthLabel = `${currentMonth.toLocaleString("pt-PT", { month: "long" })} ${currentMonth.getFullYear()}`;

  const toggleService = (id: string) =>
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleMonthChange = (dir: number) => {
    const m = new Date(currentMonth);
    m.setMonth(m.getMonth() + dir);
    setCurrentMonth(m);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(2000, 0, 1, h, m);
    d.setMinutes(d.getMinutes() + minutes);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const Header = ({ title, back }: { title: string; back?: () => void }) => (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h4 className="fw-bold">{title}</h4>
      {back ? (
        <button className="btn btn-link text-muted" onClick={back}>
          &lt; voltar
        </button>
      ) : (
        <button className="btn btn-link text-muted" onClick={onClose}>
          &lt; voltar
        </button>
      )}
    </div>
  );

  // Finaliza e devolve apenas dados de front ao parent (sem backend)
  const handleFinalize = () => {
    if (!selectedDate || !selectedTime) return;

    const serviceNames = selectedServices
      .map((id) => servicesList.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const payload: AppointmentFormData = {
      clientName: `${client.nome} ${client.apelido}`.trim(),
      carMake: "",              // não recolhido neste fluxo
      carModel: "",             // não recolhido neste fluxo
      carYear: new Date().getFullYear(),
      carPlate: client.matricula || "",
      serviceType: serviceNames || "Serviço",
      serviceDescription: notes || "Sem descrição adicional",
      date: selectedDate.toISOString().split("T")[0], // YYYY-MM-DD
      startTime: selectedTime,
      endTime: addMinutes(selectedTime, 60),
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content p-4 rounded-4 shadow-lg border-0">
          {/* === STEP 1: Serviços === */}
          {step === 1 && (
            <>
              <Header title="Escolha os Serviços" />
              <div className="row g-3">
                {servicesList.map((s) => (
                  <div className="col-md-6" key={s.id}>
                    <ServiceCard
                      service={s}
                      selected={selectedServices.includes(s.id)}
                      onClick={() => toggleService(s.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="form-label text-muted">Observações</label>
                <textarea
                  className="form-control rounded-4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Escreva observações adicionais..."
                />
              </div>

              <div className="text-center mt-4">
                <button
                  className="btn btn-primary rounded-pill px-5"
                  disabled={!selectedServices.length}
                  onClick={() => setStep(2)}
                >
                  Avançar
                </button>
              </div>
            </>
          )}

          {/* === STEP 2: Data e hora === */}
          {step === 2 && (
            <>
              <Header title="Escolher Data e Hora" back={() => setStep(1)} />
              <div className="row">
                <div className="col-md-4 mb-4">
                  <SummaryPanel selectedServices={selectedServices} />
                </div>

                <div className="col-md-8">
                  <div className="text-center mb-4">
                    <button className="btn btn-danger rounded-4 px-4 py-2">
                      <i className="bi bi-car-front me-2"></i>Levar à Oficina
                    </button>
                  </div>

                  <div className="border rounded-4 p-3 text-center mb-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <button className="btn btn-link text-dark p-0 fs-5" onClick={() => handleMonthChange(-1)}>
                        &lt;
                      </button>
                      <span className="fw-medium text-capitalize">
                        {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                      </span>
                      <button className="btn btn-link text-dark p-0 fs-5" onClick={() => handleMonthChange(1)}>
                        &gt;
                      </button>
                    </div>

                    <div className="d-flex justify-content-center gap-4 text-muted small mb-3">
                      {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => (
                        <div key={d} style={{ width: "40px" }}>
                          {d}
                        </div>
                      ))}
                    </div>

                    <div
                      className="d-grid"
                      style={{ gridTemplateColumns: "repeat(5, 1fr)", justifyItems: "center", rowGap: "10px" }}
                    >
                      {workDays.map((d) => (
                        <div
                          key={d.toDateString()}
                          onClick={() => setSelectedDate(d)}
                          className={`rounded-circle d-flex align-items-center justify-content-center ${
                            selectedDate?.toDateString() === d.toDateString() ? "bg-danger text-white" : "text-muted"
                          }`}
                          style={{ width: "38px", height: "38px", cursor: "pointer" }}
                        >
                          {d.getDate()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="text-center">
                      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                        {hours.map((h) => (
                          <button
                            key={h}
                            className={`btn rounded-pill px-3 border ${
                              selectedTime === h ? "btn-danger text-white" : "btn-outline-secondary"
                            }`}
                            onClick={() => setSelectedTime(h)}
                          >
                            {h}
                          </button>
                        ))}
                      </div>

                      <button
                        className="btn btn-primary rounded-pill px-5"
                        disabled={!selectedTime}
                        onClick={() => setStep(3)}
                      >
                        Avançar para Meus Dados
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* === STEP 3: Dados pessoais === */}
          {step === 3 && (
            <>
              <Header title="Os Meus Dados" back={() => setStep(2)} />
              <div className="row">
                <div className="col-md-4">
                  <SummaryPanel
                    selectedServices={selectedServices}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                  />
                </div>

                <div className="col-md-8">
                  <h6 className="fw-bold mb-3">A minha Viatura</h6>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Matrícula"
                    value={client.matricula}
                    onChange={(e) => setClient({ ...client, matricula: e.target.value })}
                  />
                  {client.matricula && <div className="text-success small mb-3">✅ Matrícula validada.</div>}

                  <h6 className="fw-bold mb-3 mt-3">Os meus Dados</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={client.nome}
                        onChange={(e) => setClient({ ...client, nome: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Apelido"
                        value={client.apelido}
                        onChange={(e) => setClient({ ...client, apelido: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={client.email}
                        onChange={(e) => setClient({ ...client, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Telemóvel"
                        value={client.telefone}
                        onChange={(e) => setClient({ ...client, telefone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="NIF"
                        value={client.nif}
                        onChange={(e) => setClient({ ...client, nif: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Data de Nascimento"
                        value={client.dataNascimento}
                        onChange={(e) => setClient({ ...client, dataNascimento: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Morada"
                        value={client.morada}
                        onChange={(e) => setClient({ ...client, morada: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Código Postal"
                        value={client.codigoPostal}
                        onChange={(e) => setClient({ ...client, codigoPostal: e.target.value })}
                      />
                    </div>
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Localidade"
                        value={client.localidade}
                        onChange={(e) => setClient({ ...client, localidade: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="text-center mt-3">
                    <button
                      className="btn btn-danger rounded-pill px-5"
                      onClick={handleFinalize}
                      disabled={
                        !selectedDate ||
                        !selectedTime ||
                        !selectedServices.length ||
                        !client.nome ||
                        !client.apelido ||
                        !client.email ||
                        !client.telefone ||
                        !client.nif ||
                        !client.morada ||
                        !client.codigoPostal ||
                        !client.localidade
                      }
                    >
                      Finalizar Marcação
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAppointment;
