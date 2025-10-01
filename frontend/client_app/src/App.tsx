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
