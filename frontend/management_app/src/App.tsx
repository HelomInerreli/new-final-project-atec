import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Layout } from "./pages/master/Layout";
import Home from "./pages/Home";
import Appointments from "./components/appointments";
import Examples from "./components/Examples";

function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Examples />} />
            <Route path="/appointments" element={<Appointments />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;
