import http from "../api/http";
import type { User } from "../interfaces/user";

/**
 * Busca lista de todos os utilizadores
 * Utiliza instância Axios configurada com autenticação
 * @returns Promise com array de objetos User
 * @throws Erro HTTP se falhar a requisição
 */
export const getUsers = async (): Promise<User[]> => {
  const { data } = await http.get<User[]>("/users");
  return data;
};
