import "./styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/master/Layout";
import { CustomerList } from "./components/CustomerList";
import Home from "./pages/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clients" element={<CustomerList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
