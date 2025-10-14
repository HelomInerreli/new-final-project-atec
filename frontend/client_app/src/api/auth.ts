import http from './http';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
}

export interface GoogleAuthData {
  token: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerWithCredentials = async (data: RegisterData) => {
  const response = await http.post('/customersauth/register', data);
  return response.data;
};

export const registerWithGoogle = async (data: GoogleAuthData) => {
  const response = await http.post('/customersauth/google/register', data);
  return response.data;
};

export const initiateGoogleAuth = async () => {
  const response = await http.get('/customersauth/google/url');
  return response.data;
};

export const loginWithCredentials = async (data: LoginData) => {
  const response = await http.post('/customersauth/login', data);
  return response.data;
};

export const loginWithGoogle = async (data: GoogleAuthData) => {
  const response = await http.post('/customersauth/google/login', data);
  return response.data;
};

// Utility function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};