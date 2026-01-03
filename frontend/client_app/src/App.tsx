import "./styles/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./pages/master/Layout";
import { CustomerList } from "./components/CustomerList";
import { ServiceHistory } from "./components/ServiceHistory";
import Home from "./pages/Home/Home";
import { AppointmentList } from "./components/AppointmentList";
import { ServicesList } from "./components/ServicesList";
import Register from "./components/Register";
import AuthCallback from "./components/AuthCallback";
import { FutureAppointments } from "./components/FutureAppointement";
import { ClientLayout } from "./pages/clientLayout/ClientLayout";
import Profile from "./pages/profile/profile";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clients" element={<CustomerList />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/future-appointments" element={<FutureAppointments />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route
            path="/appointments/:customerId"
            element={<AppointmentList />}
          />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-services" element={<ClientLayout />} />
          {/* Redirect old routes to home */}
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
