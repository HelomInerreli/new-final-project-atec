import React from "react";
import "../../styles/completed-services.css";

/**
 * Interface para representar um serviço concluído
 * @property id - Identificador único do serviço
 * @property nome - Nome descritivo do serviço realizado
 * @property data - Data de realização do serviço (formato ISO)
 * @property cliente - Nome do cliente que solicitou o serviço
 * @property descricao - Descrição detalhada do serviço executado
 * @property valor - Valor cobrado pelo serviço (em euros)
 */
interface Service {
  id: number;
  nome: string;
  data: string;
  cliente: string;
  descricao: string;
  valor: number;
}

/**
 * Array de serviços realizados (dados mockados para demonstração)
 * Em produção, estes dados viriam de uma API
 */
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

/**
 * Formatador de valores monetários para formato português (€)
 */
const currency = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

/**
 * Componente de página para exibir serviços concluídos
 * Apresenta tabela responsiva com lista de serviços realizados
 * Inclui informações: nome, data, cliente, descrição e valor formatado
 * Nota: Atualmente usa dados mockados - em produção conectar a API
 * @returns Componente JSX da página de serviços concluídos
 */
const CompletedServices: React.FC = () => {
  return (
    <div className="completed-services">
      {/* Cabeçalho da página */}
      <h1>Serviços realizados</h1>
      <p className="subtitle">Veja os serviços que já foram realizados</p>

      {/* Tabela responsiva de serviços concluídos */}
      <table className="completed-services-table">
        {/* Cabeçalho da tabela */}
        <thead>
          <tr>
            <th>Nome do Serviço</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Descrição</th>
            <th className="right">Valor (€)</th>
          </tr>
        </thead>
        {/* Corpo da tabela com linhas de serviços */}
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
