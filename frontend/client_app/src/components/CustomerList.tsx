import { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import type { Customer } from "../interfaces/customer";

export function CustomerList() {
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
  }, []);

  return (
    <>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">Lista de Clientes</h1>
        <p className="lead text-muted">
          Gestão completa dos clientes da Mecatec
        </p>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">A carregar...</span>
          </div>
          <p className="mt-3 text-primary">A carregar clientes...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Clientes Cadastrados ({customers.length})
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Email</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">Endereço</th>
                    <th scope="col">Idade</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="fw-bold">{customer.id}</td>
                        <td>{customer.name}</td>
                        <td>
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-decoration-none"
                          >
                            {customer.email}
                          </a>
                        </td>
                        <td>
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-decoration-none"
                          >
                            {customer.phone}
                          </a>
                        </td>
                        <td className="text-muted small">{customer.address}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {customer.age} anos
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-1 d-block mb-3 text-muted"></i>
                        Nenhum cliente cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="alert alert-success mt-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>API Conectada!</strong> Se estiver vendo esta lista, a
            comunicação com o backend está funcionando corretamente.
          </div>
        </>
      )}
    </>
  );
}
