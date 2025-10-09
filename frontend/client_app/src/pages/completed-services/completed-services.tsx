import React from "react";
import "../../styles/completed-services.css";

interface Service {
  id: number;
  nome: string;
  data: string;
  cliente: string;
  descricao: string;
  valor: number;
}

const servicosRealizados: Service[] = [
  {
    id: 1,
    nome: "Instalação de Ar Condicionado",
    data: "2024-06-10",
    cliente: "João Silva",
    descricao: "Instalação de ar condicionado split 12000 BTUs.",
    valor: 350,
  },
  {
    id: 2,
    nome: "Reparo Elétrico",
    data: "2024-06-08",
    cliente: "Maria Souza",
    descricao: "Troca de disjuntor e revisão da fiação.",
    valor: 200,
  },
];

const CompletedServices: React.FC = () => {
  return (
    <div>
      <h1>Serviços realizados</h1>
      <p className="subtitle">Veja os serviços que já foram realizados</p>
      <table className="completed-services-table">
        <thead>
          <tr>
            <th>Nome do Serviço</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Descrição</th>
            <th>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          {servicosRealizados.map((servico) => (
            <tr key={servico.id}>
              <td>{servico.nome}</td>
              <td>{servico.data}</td>
              <td>{servico.cliente}</td>
              <td>{servico.descricao}</td>
              <td>{servico.valor.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedServices;
