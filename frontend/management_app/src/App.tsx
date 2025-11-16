import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Layout } from "./pages/master/Layout";
import Home from "./pages/Home";
import Appointments from "./pages/appointments";
import Examples from "./components/Examples";
import ServiceOrders from "./components/ServiceOrders";
import ServiceOrderDetail from "./components/ServiceOrderDetail";
import ServicesManagement from "./pages/ServicesManagement";


function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Examples />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/servicesOrders" element={<ServiceOrders />} />
            <Route path="/orders/:id" element={<ServiceOrderDetail />} />
            <Route path="/servicesManagement" element={<ServicesManagement />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;
