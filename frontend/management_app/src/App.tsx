import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Login from "./pages/login/login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { isAuthenticated } from "./utils/auth";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  // If not authenticated, show only login page without Layout
  if (!isAuthenticated()) {
    return <Login />;
  }

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/examples"
                element={
                  <ProtectedRoute>
                    <Examples />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock"
                element={
                  <ProtectedRoute>
                    <MainStock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servicesOrders"
                element={
                  <ProtectedRoute>
                    <ServiceOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servicesOrders/:id"
                element={
                  <ProtectedRoute>
                    <ServiceOrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/folgas"
                element={
                  <ProtectedRoute>
                    <Folgas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ferias"
                element={
                  <ProtectedRoute>
                    <Ferias />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servicesManagement"
                element={
                  <ProtectedRoute>
                    <ServicesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <ProtectedRoute>
                    <CustomerDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ProtectedRoute>
                    <Finance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute>
                    <Vehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles/:id"
                element={
                  <ProtectedRoute>
                    <VehicleDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
