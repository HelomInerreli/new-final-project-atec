import http from './http';
import { useState, useEffect } from 'react';

//#region INTERFACES
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
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
  country?: string;
  birth_date?: string;
}

export interface FacebookAuthData {
  token: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

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
  password_hash?: string | null;
  google_id?: string | null;
  facebook_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PasswordData {
  currentPassword?: string;
  newPassword: string;
}

//#endregion

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
  localStorage.removeItem('customer_name');
  localStorage.removeItem('customer_id');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('customer_name');
  sessionStorage.removeItem('customer_id');
  delete http.defaults.headers.common['Authorization'];
};

export const checkEmailExists = async (email: string) => {
  const response = await http.get(`/customersauth/check-email?email=${encodeURIComponent(email)}`);
  return response.data;
};
//#endregion

//#region CUSTOMER API
export const getCustomerDetails = async (customerId: number): Promise<CustomerDetails> => {
  const response = await http.get(`/customersauth/me`);
  
  const data = response.data;
  console.log('Raw /me response:', data); // Debug log
  
  return {
    id: data.customer_info?.id || customerId,
    name: data.customer_info?.name || "",
    email: data.auth_info?.email || "",
    phone: data.customer_info?.phone || "",
    address: data.customer_info?.address || "",
    city: data.customer_info?.city || "",
    postal_code: data.customer_info?.postal_code || "",
    country: data.customer_info?.country || "",
    birth_date: data.customer_info?.birth_date || "",
    // Auth fields
    password_hash: data.linked_accounts?.has_password ? "***" : undefined,
    google_id: data.auth_info?.google_id || undefined,
    facebook_id: data.auth_info?.facebook_id || undefined,
    created_at: data.customer_info?.created_at || "",
    updated_at: data.customer_info?.updated_at || ""
  };
};

export const createPassword = async (data: { newPassword: string }) => {
  const response = await http.post('/customersauth/create-password', {
    new_password: data.newPassword
  });
  return response.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const response = await http.put('/customersauth/change-password', {
    current_password: data.currentPassword,
    new_password: data.newPassword
  });
  return response.data;
};

export const unlinkGoogle = async () => {
  const response = await http.delete('/customersauth/unlink/google');
  return response.data;
};

export const unlinkFacebook = async () => {
  const response = await http.delete('/customersauth/unlink/facebook');
  return response.data;
};
//#endregion

//#region useAuth HOOK
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInCustomerId, setLoggedInCustomerId] = useState<number | null>(null);
  const [loggedInCustomerName, setLoggedInCustomerName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Stored name from localStorage
  const fetchCustomerName = async (customerId: number) => {
    try {
      const customerDetails = await getCustomerDetails(customerId);
      setLoggedInCustomerName(customerDetails.name);
      localStorage.setItem('customer_name', customerDetails.name);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      setLoggedInCustomerName(null);
    }
  };


  const checkAuth = () => {
    const storedToken = getStoredToken();
    const storedName = localStorage.getItem('customer_name'); // Add this line

    
    if (storedToken && isTokenValid(storedToken)) {
      const customerId = getCustomerIdFromToken(storedToken);
      setToken(storedToken);
      setIsLoggedIn(true);
      setLoggedInCustomerId(customerId);
      setLoggedInCustomerName(storedName);

      if (customerId && !storedName) {
        fetchCustomerName(customerId);
      }

      return true;
    } else {
      // Token is invalid or expired
      removeToken();
      setToken(null);
      setIsLoggedIn(false);
      setLoggedInCustomerId(null);
      setLoggedInCustomerName(null);
      return false;
    }
  };

  const login = async (newToken: string) => {
    setAuthToken(newToken);
    const customerId = getCustomerIdFromToken(newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    setLoggedInCustomerId(customerId);

    if (customerId) {
      await fetchCustomerName(customerId);
    }
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setIsLoggedIn(false);
    setLoggedInCustomerId(null);
    setLoggedInCustomerName(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isLoggedIn,
    loggedInCustomerId,
    loggedInCustomerName,
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

export const registerWithFacebook = async (data: FacebookAuthData) => {
  const response = await http.post('/customersauth/facebook/register', data);
  return response.data;
};

export const initiateGoogleAuth = async () => {
  const response = await http.get('/customersauth/google/');
  return response.data;
};

export const initiateFacebookAuth = async () => {
  const response = await http.get('/customersauth/facebook/');
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

export const loginWithFacebook = async (data: FacebookAuthData) => {
  const response = await http.post('/customersauth/facebook/login', data);
  return response.data;
};
//#endregion