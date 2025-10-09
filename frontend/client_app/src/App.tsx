import "./styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/master/Layout";
import { CustomerList } from "./components/CustomerList";
import { ServiceHistory } from "./components/ServiceHistory";
import Home from "./pages/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clients" element={<CustomerList />} />
          <Route path="/service-history" element={<ServiceHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
