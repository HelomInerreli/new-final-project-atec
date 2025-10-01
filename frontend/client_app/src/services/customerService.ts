import http from "../api/http";
import type { Customer } from "../interfaces/customer";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await http.get<Customer[]>("/customers");
  return data;
};
