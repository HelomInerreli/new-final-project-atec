import React, { useState } from "react";


interface NewAppointmentProps {
  onClose: () => void;
}

interface Service {
  id: string;
  name: string;
  icon: string;
  isNew?: boolean;
}

const servicesList: Service[] = [
  { id: "rev", name: "Revisão Oficial", icon: "bi bi-wrench" },
  { id: "insp", name: "Inspeção Obrigatória", icon: "bi bi-clipboard-check" },
  { id: "check", name: "Check-up", icon: "bi bi-tools" },
  { id: "lamp", name: "Lâmpadas", icon: "bi bi-lightbulb" },
  { id: "oleo", name: "Mudança de Óleo", icon: "bi bi-droplet" },
  { id: "trav", name: "Travões", icon: "bi bi-disc" },
  { id: "ar", name: "Ar Condicionado", icon: "bi bi-snow" },
  { id: "pneus", name: "Pneus", icon: "bi bi-circle-half" },
  { id: "diag", name: "Diagnóstico Electrónico", icon: "bi bi-cpu", isNew: true },
  { id: "bat", name: "Baterias Auto", icon: "bi bi-battery-half" },
  { id: "amort", name: "Amortecedores", icon: "bi bi-tools" },
  { id: "outros", name: "Outros", icon: "bi bi-question-circle" },
];

const NewAppointment: React.FC<NewAppointmentProps> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clientData, setClientData] = useState({
    matricula: "",
    nome: "",
    apelido: "",
    email: "",
    telefone: "",
  });

  // horários
  const hours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
  ];

  const generateWorkDays = (month: Date) => {
    const days: Date[] = [];
    const date = new Date(month.getFullYear(), month.getMonth(), 1);
    while (date.getMonth() === month.getMonth()) {
      const day = date.getDay();
      if (day >= 1 && day <= 5) days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const workDays = generateWorkDays(currentMonth);

  const handleMonthChange = (dir: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const handleFinalize = () => {
    alert(`✅ Marcação finalizada!
Serviços: ${selectedServices.join(", ")}
Data: ${selectedDate?.toLocaleDateString("pt-PT")}
Hora: ${selectedTime}
Cliente: ${clientData.nome} ${clientData.apelido}`);
    onClose();
  };

  const monthLabel = `${currentMonth.toLocaleString("pt-PT", {
    month: "long",
  })} ${currentMonth.getFullYear()}`;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content p-4 rounded-4 shadow-lg">

          {/* ========= STEP 1 ========= */}
          {step === 1 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Escolha os Serviços</h4>
                <button className="btn btn-link text-muted" onClick={onClose}>
                  &lt; voltar
                </button>
              </div>

              <div className="row g-3">
                {servicesList.map((s) => (
                  <div className="col-md-6" key={s.id}>
                    <div
                      className={`d-flex align-items-center justify-content-between border rounded-4 px-3 py-3 service-card ${
                        selectedServices.includes(s.id) ? "active" : ""
                      }`}
                      onClick={() => toggleService(s.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(s.id)}
                          readOnly
                        />
                        <i className={`${s.icon} fs-4 text-secondary`}></i>
                        <span>{s.name}</span>
                        {s.isNew && (
                          <span className="badge bg-danger ms-2">NOVO</span>
                        )}
                      </div>
                    </div>
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
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(2)}
                >
                  Avançar
                </button>
              </div>
            </>
          )}

          {/* ========= STEP 2 ========= */}
          {step === 2 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Escolher Data e Hora</h4>
                <button
                  className="btn btn-link text-muted"
                  onClick={() => setStep(1)}
                >
                  &lt; voltar
                </button>
              </div>

              <div className="row">
                <div className="col-md-4 mb-4">
                  <div className="border rounded-4 p-3">
                    <h6 className="text-danger fw-bold mb-3">A minha Marcação</h6>
                    <ul className="list-unstyled small text-muted mb-0">
                      {selectedServices.map((s) => (
                        <li key={s}>• {servicesList.find((x) => x.id === s)?.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="text-center mb-4">
                    <button className="btn btn-danger rounded-4 px-4 py-2">
                      <i className="bi bi-car-front me-2"></i>Levar à Oficina
                    </button>
                  </div>

                  <div className="border rounded-4 p-3 text-center mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <button
                        className="btn btn-link text-dark p-0 fs-5"
                        onClick={() => handleMonthChange(-1)}
                      >
                        &lt;
                      </button>
                      <span className="fw-medium text-capitalize">
                        {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                      </span>
                      <button
                        className="btn btn-link text-dark p-0 fs-5"
                        onClick={() => handleMonthChange(1)}
                      >
                        &gt;
                      </button>
                    </div>

                    <div className="d-flex justify-content-between text-muted small mb-2">
                      {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => (
                        <div key={d} style={{ width: "36px" }}>
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="d-flex flex-wrap justify-content-start">
                      {workDays.map((d) => (
                        <div
                          key={d.toDateString()}
                          className={`rounded-circle p-2 text-center mb-2 mx-1 ${
                            selectedDate?.toDateString() === d.toDateString()
                              ? "bg-danger text-white"
                              : "text-muted"
                          }`}
                          style={{
                            width: "36px",
                            height: "36px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedDate(d)}
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
                            className={`btn btn-outline-secondary rounded-pill px-3 ${
                              selectedTime === h ? "btn-danger text-white" : ""
                            }`}
                            onClick={() => setSelectedTime(h)}
                          >
                            {h}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
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

          {/* ========= STEP 3 ========= */}
          {step === 3 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Os Meus Dados</h4>
                <button
                  className="btn btn-link text-muted"
                  onClick={() => setStep(2)}
                >
                  &lt; voltar
                </button>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="border rounded-4 p-3">
                    <h6 className="text-danger fw-bold mb-3">
                      A minha Marcação
                    </h6>
                    <p className="small text-muted mb-2">
                      {selectedServices.length} serviço(s) escolhido(s):
                    </p>
                    <ul className="list-unstyled small text-muted">
                      {selectedServices.map((s) => (
                        <li key={s}>• {servicesList.find((x) => x.id === s)?.name}</li>
                      ))}
                    </ul>
                    <hr />
                    <p className="mb-1 small text-muted">
                      Data: {selectedDate?.toLocaleDateString("pt-PT")}
                    </p>
                    <p className="small text-muted">Hora: {selectedTime}</p>
                  </div>
                </div>

                <div className="col-md-8">
                  <h6 className="fw-bold mb-3">A minha Viatura</h6>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Matrícula"
                    value={clientData.matricula}
                    onChange={(e) =>
                      setClientData({ ...clientData, matricula: e.target.value })
                    }
                  />
                  {clientData.matricula && (
                    <div className="text-success small mb-3">
                      ✅ A sua matrícula foi encontrada e validada.
                    </div>
                  )}

                  <h6 className="fw-bold mb-3 mt-3">Os meus Dados</h6>
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={clientData.nome}
                        onChange={(e) =>
                          setClientData({ ...clientData, nome: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Apelido"
                        value={clientData.apelido}
                        onChange={(e) =>
                          setClientData({ ...clientData, apelido: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="email"
                    className="form-control mb-2"
                    placeholder="Email"
                    value={clientData.email}
                    onChange={(e) =>
                      setClientData({ ...clientData, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    className="form-control mb-4"
                    placeholder="Telemóvel"
                    value={clientData.telefone}
                    onChange={(e) =>
                      setClientData({ ...clientData, telefone: e.target.value })
                    }
                  />

                  <div className="text-center">
                    <button
                      className="btn btn-danger rounded-pill px-5"
                      onClick={handleFinalize}
                      disabled={
                        !clientData.nome ||
                        !clientData.apelido ||
                        !clientData.email ||
                        !clientData.telefone
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
