import http from './http';
import { useState, useEffect } from 'react';

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

//#region TOKEN UTILITIES
export const setAuthToken = (token: string) => {
  localStorage.setItem('access_token', token); // Fixed: use consistent key
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

export const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const getCustomerIdFromToken = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ? parseInt(payload.sub) : null;
  } catch (error) {
    return null;
  }
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  delete http.defaults.headers.common['Authorization']; // Also remove from axios
};
//#endregion

//#region useAuth HOOK
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInCustomerId, setLoggedInCustomerId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const checkAuth = () => {
    const storedToken = getStoredToken();
    
    if (storedToken && isTokenValid(storedToken)) {
      const customerId = getCustomerIdFromToken(storedToken);
      setToken(storedToken);
      setIsLoggedIn(true);
      setLoggedInCustomerId(customerId);
      return true;
    } else {
      // Token is invalid or expired
      removeToken();
      setToken(null);
      setIsLoggedIn(false);
      setLoggedInCustomerId(null);
      return false;
    }
  };

  const login = (newToken: string) => {
    setAuthToken(newToken);
    const customerId = getCustomerIdFromToken(newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    setLoggedInCustomerId(customerId);
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setIsLoggedIn(false);
    setLoggedInCustomerId(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isLoggedIn,
    loggedInCustomerId,
    token,
    login,
    logout,
    checkAuth
  };
};
//#endregion

//#region AUTHENTICATION API CALLS REGISTER
export const registerWithCredentials = async (data: RegisterData) => {
  const response = await http.post('/customersauth/register', data);
  return response.data;
};

export const registerWithGoogle = async (data: GoogleAuthData) => {
  const response = await http.post('/customersauth/google/register', data);
  return response.data;
};

export const initiateGoogleAuth = async () => {
  const response = await http.get('/customersauth/google/');
  return response.data;
};
//#endregion

//#region AUTHENTICATION API CALLS LOGIN
export const loginWithCredentials = async (data: LoginData) => {
  const response = await http.post('/customersauth/token', {
    username: data.email, // OAuth2PasswordRequestForm expects 'username' field
    password: data.password,
    grant_type: 'password'
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });
  return response.data;
};

export const loginWithGoogle = async (data: GoogleAuthData) => {
  const response = await http.post('/customersauth/google/login', data);
  return response.data;
};
//#endregion

