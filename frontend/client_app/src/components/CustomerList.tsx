import { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import type { Customer } from "../interfaces/customer";
import '../i18n';
import { useTranslation } from "react-i18next";

/**
 * Componente para listar todos os clientes registados no sistema
 * Exibe uma tabela com informações dos clientes (nome, email, telefone, morada, idade)
 * @returns Componente JSX com a lista de clientes ou mensagens de estado
 */
export function CustomerList() {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Estado para armazenar a lista de clientes
   * Tipo: Array de Customer
   * Inicia como array vazio
   */
  const [customers, setCustomers] = useState<Customer[]>([]);

  /**
   * Estado para indicar se os dados estão sendo carregados
   * Tipo: boolean
   * Inicia como true
   */
  const [loading, setLoading] = useState(true);

  /**
   * Estado para armazenar mensagens de erro
   * Tipo: string | null
   * Inicia como null (sem erro)
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Efeito para carregar a lista de clientes ao montar o componente
   * Busca os dados da API e atualiza o estado
   * Executa apenas uma vez ao montar
   */
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setError(null);
      } catch (err) {
        setError(t('errorLoadingCustomers'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <>
      {/* Cabeçalho da página com título e descrição */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">{t('customerList')}</h1>
        <p className="lead text-muted">
          {t('customerManagementDescription')}
        </p>
      </div>

      {/* Indicador de carregamento */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}...</span>
          </div>
          <p className="mt-3 text-primary">{t('loadingCustomers')}...</p>
        </div>
      )}

      {/* Alerta de erro, exibido apenas se houver erro */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Tabela de clientes - exibida apenas quando carregamento termina sem erros */}
      {!loading && !error && (
        <>
          <div className="card shadow-sm">
            {/* Cabeçalho do cartão com contador de clientes */}
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                {t('registeredCustomers')} ({customers.length})
              </h5>
            </div>

            {/* Tabela responsiva com dados dos clientes */}
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                {/* Cabeçalho da tabela */}
                <thead className="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">{t('name')}</th>
                    <th scope="col">{t('email')}</th>
                    <th scope="col">{t('phone')}</th>
                    <th scope="col">{t('address')}</th>
                    <th scope="col">{t('age')}</th>
                  </tr>
                </thead>

                {/* Corpo da tabela com lista de clientes ou mensagem de lista vazia */}
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
                            {customer.age} {t('years')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-1 d-block mb-3 text-muted"></i>
                        {t('noCustomersFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerta de sucesso confirmando conexão com API */}
          <div className="alert alert-success mt-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>{t('apiConnected')}</strong> - {t('customerDataFetchedSuccessfully')}
          </div>
        </>
      )}
    </>
  );
}
