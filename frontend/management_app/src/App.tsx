import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Layout } from "./pages/master/Layout";
import Home from "./pages/Home";
import Appointments from "./pages/appointments";
import Examples from "./components/Examples";
import ServiceOrders from "./components/ServiceOrders";
import ServiceOrderDetail from "./components/ServiceOrderDetail";
import MainStock from "./pages/Stock/mainStock";
import ServicesManagement from "./pages/ServicesManagement";
import Customers from "./pages/Customers/Customers";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Vehicles from "./pages/Vehicles/Vehicles";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Examples />} />
            <Route path="/stock" element={<MainStock />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/servicesOrders" element={<ServiceOrders />} />
            <Route path="/orders/:id" element={<ServiceOrderDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route
              path="/servicesManagement"
              element={<ServicesManagement />}
            />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/vehicles" element={<Vehicles />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
