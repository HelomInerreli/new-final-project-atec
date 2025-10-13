import React, { useMemo, useState } from "react";
import "../../styles/invoices.css";

type InvoiceStatus = "paga" | "pendente" | "vencida";

type Invoice = {
  id: string;
  number: string;
  client: string;
  issueDate: string; // ISO yyyy-mm-dd
  total: number;     // EUR
  status: InvoiceStatus;
};

const MOCK_INVOICES: Invoice[] = [
  { id: "1", number: "FT-2025-001", client: "Acme Lda.",  issueDate: "2025-01-15", total: 1240.5, status: "paga" },
  { id: "2", number: "FT-2025-002", client: "Blue Ocean", issueDate: "2025-02-10", total: 320.0,  status: "pendente" },
  { id: "3", number: "FT-2025-003", client: "NuvemTech",  issueDate: "2025-03-01", total: 980.75, status: "paga" },
  { id: "4", number: "FT-2025-004", client: "Café Bairro",issueDate: "2025-04-05", total: 65.2,   status: "vencida" },
];

const currency = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

const Invoices: React.FC = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"todas" | InvoiceStatus>("todas");

  const items = useMemo(() => {
    return MOCK_INVOICES.filter((inv) => {
      const matchesQuery =
        !query ||
        inv.number.toLowerCase().includes(query.toLowerCase()) ||
        inv.client.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "todas" || inv.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div className="invoices">
      <h2>Faturas</h2>

      <div className="inv-toolbar">
        <input
          className="inv-input"
          placeholder="Pesquisar nº ou cliente"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="inv-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="todas">Todas</option>
          <option value="paga">Paga</option>
          <option value="pendente">Pendente</option>
          <option value="vencida">Vencida</option>
        </select>
        <button className="btn primary">+ Nova fatura</button>
      </div>

      <div className="inv-card">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Emissão</th>
              <th className="right">Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">Sem resultados</td>
              </tr>
            )}
            {items.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.number}</td>
                <td>{inv.client}</td>
                <td>{new Date(inv.issueDate).toLocaleDateString("pt-PT")}</td>
                <td className="right">{currency.format(inv.total)}</td>
                <td>
                  <span className={`status-pill ${inv.status}`}>
                    {inv.status === "paga" ? "Paga" : inv.status === "pendente" ? "Pendente" : "Vencida"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Invoices;
