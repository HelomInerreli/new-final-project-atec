import { useEffect, useState } from "react";
import "./styles/App.css";
import { getCustomers } from "./services/customerService";
import type { Customer } from "./interfaces/customer";

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setError(null);
      } catch (err) {
        setError("Falha ao buscar os clientes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []); // O array vazio faz com que o useEffect execute apenas uma vez

  return (
    <>
      <div className="container">
        <div className="bg-white p-6 shadow-xl rounded-xl transition hover:shadow-2xl">
          <h2 className="text-xl font-bold text-center mb-4 text-atec-cinza-chumbo"></h2>
          <div className="logo-container bg-gray-100 rounded-lg p-4">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              <g
                transform="translate(45, 50)"
                fill="none"
                stroke-linecap="round"
              >
                <circle
                  cx="0"
                  cy="0"
                  r="30"
                  stroke="#4F4F4F"
                  stroke-width="6"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="40"
                  stroke="#FFD700"
                  stroke-width="6"
                />
                <path
                  d="M -50 0 A 50 50 0 1 1 45 0"
                  stroke="#4F4F4F"
                  stroke-width="6"
                />
              </g>
              <text
                x="110"
                y="65"
                font-size="50"
                fill="#4F4F4F"
                font-style="italic"
                className="svg-text"
              >
                Rod
              </text>
              <text
                x="190"
                y="65"
                font-size="50"
                fill="#2614c4ff"
                className="svg-text"
              >
                Atec
              </text>
            </svg>
          </div>
        </div>
        <h1 className="text-center mt-5 title">
          Lista de Clientes - Página Agendamento
        </h1>
        {loading && <p>A carregar...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* <ul>
          {customers.map((customer) => (
            <li key={customer.id}>
              {customer.name} - ({customer.email})
            </li>
          ))}
        </ul> */}
        <table className="table table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
                <td>{customer.age}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-success mt-4">
          Se estiver vendo uma lista de clientes, a API está funcionando
          corretamente.
        </p>
      </div>
    </>
  );
}

export default App;
