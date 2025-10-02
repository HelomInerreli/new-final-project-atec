import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="display-4 mb-4">Sistema de Gestão</h1>
        <p className="lead mb-4">
          Bem-vindo ao sistema de gerenciamento de clientes e agendamentos
        </p>
        
        <div className="row mt-5 justify-content-center">
          <div className="col-md-5 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Clientes</h3>
                <p className="card-text">Gerencie os cadastros de clientes</p>
                <Link to="/customers" className="btn btn-primary">Ver Clientes</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-5 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Agendamentos</h3>
                <p className="card-text">Gerencie os agendamentos de serviços</p>
                <Link to="/appointments" className="btn btn-success">Ver Agendamentos</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;


// import { useEffect, useState } from "react";
// import { getUsers } from "../../services/userService";
// import type { User } from "../../interfaces/user";

// function Home() {
//   const [users, setUsers] = useState<User[]>([]);

//   useEffect(() => {
//     getUsers().then(setUsers);
//   }, []);

//   return (
//     <div className="container mt-4">
//       <h1>Usuários</h1>
//       <ul>
//         {users.map((u) => (
//           <li key={u.id}>
//             {u.name} - {u.email}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Home;
