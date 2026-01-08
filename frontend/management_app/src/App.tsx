import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Layout } from "./pages/master/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/appointments";
import Examples from "./components/Examples";
import ServiceOrders from "./components/ServiceOrders";
import ServiceOrderDetail from "./components/ServiceOrderDetail";
import MainStock from "./pages/Stock/mainStock";
import ServicesManagement from "./pages/ServicesManagement";
import Customers from "./pages/Customers/Customers";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Vehicles from "./pages/Vehicles/Vehicles";
import VehicleDetails from "./pages/Vehicles/VehicleDetails";
import { Toaster } from "./components/ui/toaster";
import Users from "./pages/Users/Users";
import Folgas from "./pages/Users/Folgas";
import Ferias from "./pages/Users/Ferias";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";

function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/examples" element={<Examples />} />
            <Route path="/stock" element={<MainStock />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/servicesOrders" element={<ServiceOrders />} />
            <Route path="/orders/:id" element={<ServiceOrderDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/folgas" element={<Folgas />} />
            <Route path="/ferias" element={<Ferias />} />
            <Route
              path="/servicesManagement"
              element={<ServicesManagement />}
            />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
