export interface CustomerDetails {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAuth {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}


export interface CompleteCustomerProfile {
  auth: CustomerAuth;
  customer: CustomerInfo;
}
