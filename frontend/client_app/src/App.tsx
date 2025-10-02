import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Appointments from "./pages/appointment";
import Customers from "./pages/customer";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">Sistema de Gestão</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/customers">Clientes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/appointments">Agendamentos</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/appointments" element={<Appointments />} />
          </Routes>
        </main>
        
        <footer className="bg-dark text-white py-3 mt-auto">
          <div className="container text-center">
            <p className="mb-0">Sistema de Gestão &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         setLoading(true);
//         const data = await getCustomers();
//         setCustomers(data);
//         setError(null);
//       } catch (err) {
//         setError("Falha ao buscar os clientes.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCustomers();
//   }, []); // O array vazio faz com que o useEffect execute apenas uma vez

//   return (
//     <>
//       <div className="container">
//         <h1 className="text-center mt-5 title">
//           Lista de Clientes - Página Agendamento
//         </h1>
//         {loading && <p>A carregar...</p>}
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {/* <ul>
//           {customers.map((customer) => (
//             <li key={customer.id}>
//               {customer.name} - ({customer.email})
//             </li>
//           ))}
//         </ul> */}
//         <table className="table table-striped mt-4">
//           <thead className="table-dark">
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Phone</th>
//               <th>Address</th>
//               <th>Age</th>
//             </tr>
//           </thead>
//           <tbody>
//             {customers.map((customer) => (
//               <tr key={customer.id}>
//                 <td>{customer.id}</td>
//                 <td>{customer.name}</td>
//                 <td>{customer.email}</td>
//                 <td>{customer.phone}</td>
//                 <td>{customer.address}</td>
//                 <td>{customer.age}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <p className="text-success mt-4">
//           Se estiver vendo uma lista de clientes, a API está funcionando
//           corretamente.
//         </p>
//       </div>
//     </>
//   );
// }

// export default App;
