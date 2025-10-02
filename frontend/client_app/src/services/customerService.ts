import type { Customer } from "../interfaces/customer";
import api from "../api/http";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await api.get<Customer[]>("/customers");
  return data;
};

export const getCustomerAppointments = async () => {
  const response = await api.get("/customers/appointments");
  console.log
  return response.data;
};
