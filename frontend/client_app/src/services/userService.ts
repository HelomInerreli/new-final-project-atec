import http from "../api/http";
import type { User } from "../interfaces/user";

export const getUsers = async (): Promise<User[]> => {
  const { data } = await http.get<User[]>("/users");
  return data;
};
