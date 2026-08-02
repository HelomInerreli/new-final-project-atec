import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://sturdy-yodel-r4p9vpqq6qv52xw5p-8000.app.github.dev/api/v1",
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
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


export default http;
