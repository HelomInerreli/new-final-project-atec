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

const currency = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

const CompletedServices: React.FC = () => {
  return (
    <div className="completed-services">
      <h1>Serviços realizados</h1>
      <p className="subtitle">Veja os serviços que já foram realizados</p>

      <table className="completed-services-table">
        <thead>
          <tr>
            <th>Nome do Serviço</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Descrição</th>
            <th className="right">Valor (€)</th>
          </tr>
        </thead>
        <tbody>
          {servicosRealizados.map((servico) => (
            <tr key={servico.id}>
              <td data-label="Serviço">{servico.nome}</td>
              <td data-label="Data">{new Date(servico.data).toLocaleDateString("pt-PT")}</td>
              <td data-label="Cliente">{servico.cliente}</td>
              <td data-label="Descrição">{servico.descricao}</td>
              <td data-label="Valor" className="right">{currency.format(servico.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedServices;
