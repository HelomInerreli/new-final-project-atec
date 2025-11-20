import { useState, useMemo } from "react";
import { useFetchCustomers } from '../hooks/useCustomers';
import { Form, Button, Badge, Table, InputGroup, Spinner, Alert } from "react-bootstrap";
import { Search, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/Customers.css";

export default function Customers() {
  //Hook call
  const { customers: rawCustomers, loading, error } = useFetchCustomers();
  
  // Local state for search term
  const [searchTerm, setSearchTerm] = useState('');

  // Mapping and filtering customers based on search term
  const filteredCustomers = useMemo(() => {
    // First, map the raw data to the structure your table needs
    const tableData = rawCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || 'N/A',
      address: `${customer.address || ''}, ${customer.city || ''}`.replace(/^,|,$/g, '').trim(),
      //PLACEHOLDERS FOR NOW
      vehicles: 0, // Placeholder
      lastVisit: new Date(customer.updated_at).toLocaleDateString('pt-PT'),
      status: 'Ativo', // Placeholder
    }));

    // Then, filter based on the search term
    if (!searchTerm) {
      return tableData;
    }
    
    const lowercasedFilter = searchTerm.toLowerCase();

    return tableData.filter(customer => {
      // Safely check name and email before calling .toLowerCase()
      const nameMatch = customer.name ? customer.name.toLowerCase().includes(lowercasedFilter) : false;
      const emailMatch = customer.email ? customer.email.toLowerCase().includes(lowercasedFilter) : false;
      return nameMatch || emailMatch;
    });
  }, [rawCustomers, searchTerm]);


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5">A Carregar Clientes...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>Clientes</h1>
        <Button variant="danger" className="add-customer-btn">
          <Plus size={18} className="me-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="search-section">
        <InputGroup>
          <InputGroup.Text>
            <Search size={18} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="customers-table-container">
        <Table hover responsive className="customers-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th className="text-center">Veículos</th>
              <th>Última Visita</th>
              <th>Status</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="fw-semibold">{customer.name}</td>
                <td className="text-muted">{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
                <td className="text-center">{customer.vehicles}</td>
                <td>{customer.lastVisit}</td>
                <td>
                  <Badge 
                    bg={customer.status === "Ativo" ? "danger" : "secondary"}
                    className="status-badge"
                  >
                    {customer.status}
                  </Badge>
                </td>
                <td className="text-center">
                  <Link 
                    to={`/clientes/${customer.id}`}
                    className="view-btn"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {filteredCustomers.length === 0 && !loading && (
          <div className="no-results">
            <p>Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}