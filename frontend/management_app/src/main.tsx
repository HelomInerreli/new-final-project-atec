import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/DatePicker.css";
import Login from "./pages/login/login.tsx";

const hasToken = !!localStorage.getItem("access_token");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{hasToken ? <App /> : <Login />}</React.StrictMode>
);
