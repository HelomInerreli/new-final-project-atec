import { useEffect, useState } from "react";
import "./styles/App.css";
import { getCustomers } from "./services/customerService";
import type { Customer } from "./interfaces/customer";
import ClientMenu from "./components/ClientMenu";

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
      

<ClientMenu />

    </>
  );
}

export default App;
