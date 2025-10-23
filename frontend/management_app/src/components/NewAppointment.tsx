import React, { useState } from 'react';
import './NewAppointment.css';

interface NewAppointmentProps {
  onClose: () => void;
  onSubmit: (appointment: any) => void;
}

const NewAppointment: React.FC<NewAppointmentProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    carMake: '',
    carModel: '',
    carYear: new Date().getFullYear(),
    carPlate: '',
    serviceType: '',
    serviceDescription: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Novo Agendamento</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Cliente</h3>
            <div className="form-field">
              <label htmlFor="clientName">Nome do Cliente</label>
              <input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Veículo</h3>
            <div className="form-group">
              <div className="form-field">
                <label htmlFor="carMake">Marca</label>
                <input
                  id="carMake"
                  type="text"
                  value={formData.carMake}
                  onChange={e => setFormData({...formData, carMake: e.target.value})}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="carModel">Modelo</label>
                <input
                  id="carModel"
                  type="text"
                  value={formData.carModel}
                  onChange={e => setFormData({...formData, carModel: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="form-field">
                <label htmlFor="carYear">Ano</label>
                <input
                  id="carYear"
                  type="number"
                  value={formData.carYear}
                  onChange={e => setFormData({...formData, carYear: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="carPlate">Matrícula</label>
                <input
                  id="carPlate"
                  type="text"
                  value={formData.carPlate}
                  onChange={e => setFormData({...formData, carPlate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Serviço</h3>
            <div className="form-field">
              <label htmlFor="serviceType">Tipo de Serviço</label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={e => setFormData({...formData, serviceType: e.target.value})}
                required
              >
                <option value="">Selecione um serviço</option>
                <option value="manutencao">Manutenção</option>
                <option value="revisao">Revisão</option>
                <option value="reparacao">Reparação</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="serviceDescription">Descrição</label>
              <textarea
                id="serviceDescription"
                value={formData.serviceDescription}
                onChange={e => setFormData({...formData, serviceDescription: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Data e Hora</h3>
            <div className="form-group">
              <div className="form-field">
                <label htmlFor="date">Data</label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="form-field">
                <label htmlFor="startTime">Hora Início</label>
                <input
                  id="startTime"
                  type="time"
                  min="09:00"
                  max="19:00"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="endTime">Hora Fim</label>
                <input
                  id="endTime"
                  type="time"
                  min="09:00"
                  max="19:00"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Criar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointment;