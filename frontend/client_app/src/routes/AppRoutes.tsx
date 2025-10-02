import { Routes, Route } from 'react-router-dom';
import Home from "../pages/home";
import Appointments from "../pages/appointment";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/appointments" element={<Appointments />} />
    </Routes>
  );
}

export default AppRoutes;