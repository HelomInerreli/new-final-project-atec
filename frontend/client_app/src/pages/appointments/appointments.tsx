import React from "react";
import "../../styles/Appointments.css";

const Appointments: React.FC = () => {
  return (
    <div className="appointments-container">
      <h1 className="appointments-title">Meus Agendamentos</h1>
      <div className="appointments-list">
      {/* Exemplo de agendamento */}
      <div className="appointment-item">
        <div>
        <strong>Serviço:</strong> Troca de Óleo
        </div>
        <div>
        <strong>Data:</strong> 15/06/2024
        </div>
        <div>
        <strong>Status:</strong> Confirmado
        </div>
      </div>
      {/* Adicione mais itens conforme necessário */}
      <div className="appointment-item">
        <div>
        <strong>Serviço:</strong> Revisão
        </div>
        <div>
        <strong>Data:</strong> 22/06/2024
        </div>
        <div>
        <strong>Status:</strong> Pendente
        </div>
      </div>
      </div>
    </div>
     
  );
};

export default Appointments;
