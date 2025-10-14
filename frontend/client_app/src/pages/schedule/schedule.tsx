import React, { useState } from "react";
import "../../styles/schedule.css";

const Schedule: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicle: "",
    service: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `✅ Agendamento confirmado!\n\nServiço: ${formData.service}\nData: ${formData.date}\nHora: ${formData.time}`
    );
  };

  return (
    <div className="schedule-page">
      <h1 className="page-title">Agendar Serviço</h1>

      <form className="schedule-layout" onSubmit={handleSubmit}>
        {/* COLUNA ESQUERDA */}
        <div className="left-column">
          <section>
            <h3 className="section-title">Dados Pessoais</h3>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Telemóvel</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="912345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Morada</label>
              <input
                type="text"
                name="address"
                placeholder="Rua, nº, cidade..."
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </section>

          <section>
            <h3 className="section-title">Viatura</h3>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
            >
              <option value="">Escolher viatura</option>
              <option value="Audi A3">Audi A3 Sportback</option>
              <option value="VW Golf">VW Golf</option>
              <option value="BMW 320d">BMW 320d</option>
              <option value="Mercedes C220">Mercedes C220</option>
              <option value="Peugeot 208">Peugeot 208</option>
            </select>
          </section>

          <section>
            <h3 className="section-title">Data e Hora</h3>
            <div className="form-row">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              >
                <option value="">Escolher hora</option>
                {times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA */}
        <div className="right-column">
          <section>
            <h3 className="section-title">Serviços Disponíveis</h3>
            <div className="services-grid">
              {servicesList.map((service) => (
                <label
                  key={service}
                  className={`service-item ${
                    formData.service === service ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service}
                    checked={formData.service === service}
                    onChange={handleInputChange}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="form-buttons">
            <button type="submit" className="btn primary">
              Confirmar Agendamento
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  vehicle: "",
                  service: "",
                  date: "",
                  time: "",
                })
              }
            >
              Limpar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Schedule;
