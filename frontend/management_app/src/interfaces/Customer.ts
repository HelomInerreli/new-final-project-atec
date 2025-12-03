export interface CustomerAuth {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfileInfo {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
}

export type Customer = CustomerDetails;

export interface CompleteCustomerProfile {
  auth: CustomerAuth;
  customer: CustomerProfileInfo;
}