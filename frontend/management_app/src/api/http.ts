import axios from "axios";
import { isTokenValid, logout } from "../utils/auth";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

//Set or remove auth token for requests (Nuno)
export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem("access_token", token);
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete http.defaults.headers.common.Authorization;
  }
}
//Set token on page load if exists (Nuno)
const saved = localStorage.getItem("access_token");
if (saved) setAuthToken(saved);

// Response interceptor to handle 401 errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized error, logout and redirect to login
    if (error.response?.status === 401) {
      const token = localStorage.getItem("access_token");

      // Only logout if we have a token (to avoid logout loop on login page)
      if (token) {
        console.warn("Token expired or invalid. Redirecting to login...");
        logout();
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor to validate token before each request
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // Skip validation for login endpoint
    if (config.url?.includes("/managementauth/login")) {
      return config;
    }

    // Check if token exists and is valid
    if (token && !isTokenValid(token)) {
      console.warn("Token expired. Redirecting to login...");
      logout();
      return Promise.reject(new Error("Token expired"));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
