import { useEffect, useState } from "react";
import "./styles/App.css";
import { getCustomers } from "./services/customerService";
import type { Customer } from "./interfaces/customer";
import ClientMenu from "./components/ClientMenu";
import Dashboard from "./pages/dashboard/Dashboard";
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from "react-router-dom";
import Invoices from "./pages/invoices/invoices";
import Appointments from "./pages/appointments/appointments";
import Vehicles from "./pages/vehicles/vehicles";
import Schedule from "./pages/schedule/schedule";
import Profile from "./pages/profile/profile";
import CompletedServices from "./pages/completed-services/completed-services";


function App() {
  

  return (
    <>
      <BrowserRouter>
        <ClientMenu />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/completed-services" element={<CompletedServices />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;


