import "./styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/master/Layout";
import { CustomerList } from "./components/CustomerList";
import { ServiceHistory } from "./components/ServiceHistory";
import Home from "./pages/Home/Home";
import { AppointmentList } from "./components/AppointmentList";
import { ServicesList } from "./components/ServicesList";
import { SobrePage } from "./pages/Sobre/SobrePage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clients" element={<CustomerList />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route
            path="/appointments/:customerId"
            element={<AppointmentList />}
          />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/about" element={<SobrePage />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
