import "./styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/master/Layout";
import { CustomerList } from "./components/CustomerList";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomerList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
