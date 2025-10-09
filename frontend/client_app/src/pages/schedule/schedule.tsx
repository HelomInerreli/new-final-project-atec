import React, { useState } from "react";
import "../../styles/schedule.css";

const Schedule: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicle: "",
    services: [] as string[],
    date: "",
    time: "",
  });

  const servicesList = [
    "Revisão Geral",
    "Mudança de Óleo e Filtros",
    "Substituição de Travões",
    "Alinhamento e Balanceamento",
    "Inspeção Periódica",
    "Troca de Pneus",
    "Ar Condicionado (Carga/Manutenção)",
    "Diagnóstico Elétrico",
    "Limpeza de Injetores",
    "Troca de Bateria",
    "Sistema de Escape",
    "Suspensão e Amortecedores",
  ];

  const times = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ agora o toggle é totalmente controlado via React
  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.services.includes(service);
      return {
        ...prev,
        services: alreadySelected
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Agendamento submetido:", formData);
    alert(
      `Agendamento efetuado com sucesso!\n\nServiços selecionados:\n${formData.services.join(
        ", "
      )}`
    );
  };

  return (
    <div className="schedule-container">
      <h1 className="title">Agendar Serviço</h1>

      <form className="schedule-form" onSubmit={handleSubmit}>
        {/* === Dados Pessoais === */}
        <div className="form-section">
          <h3 className="section-title">Dados Pessoais</h3>

          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Nome completo"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="exemplo@email.com"
              />
            </div>

            <div className="form-group">
              <label>Telemóvel</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="912345678"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Morada</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Rua, nº, cidade..."
            />
          </div>
        </div>

        {/* === Viatura === */}
        <div className="form-section">
          <h3 className="section-title">Viatura</h3>
          <div className="form-group">
            <label>Selecione a Viatura</label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              required
            >
              <option value="">Escolher viatura</option>
              <option value="Audi A3">Audi A3 Sportback</option>
              <option value="VW Golf">VW Golf</option>
              <option value="BMW 320d">BMW 320d</option>
              <option value="Mercedes C220">Mercedes C220</option>
              <option value="Peugeot 208">Peugeot 208</option>
            </select>
          </div>
        </div>

        {/* === Serviços === */}
        <div className="form-section">
          <h3 className="section-title">Serviços Disponíveis</h3>
          <div className="services-grid">
            {servicesList.map((service) => (
              <div
                key={service}
                className={`service-item ${
                  formData.services.includes(service) ? "selected" : ""
                }`}
                onClick={() => handleServiceToggle(service)}
              >
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  readOnly
                />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === Data e Hora === */}
        <div className="form-section">
          <h3 className="section-title">Data e Hora</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              >
                <option value="">Escolher hora</option>
                {times.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* === Botões === */}
        <div className="form-buttons">
          <button type="submit" className="btn primary">
            Confirmar Agendamento
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setFormData({ ...formData, services: [] })}
          >
            Limpar Seleção
          </button>
        </div>
      </form>
    </div>
  );
};

export default Schedule;
