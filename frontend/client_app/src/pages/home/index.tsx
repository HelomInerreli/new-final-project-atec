import { useEffect, useState } from "react";
import { getUsers } from "../../services/userService";
import type { User } from "../../interfaces/user";

function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <div className="container mt-4">
      <h1>Usuários</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
