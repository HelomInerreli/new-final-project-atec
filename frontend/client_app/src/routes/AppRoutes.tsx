import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ClientLayout } from "../pages/clientLayout/ClientLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Appointments from "../pages/schedule/schedule";
import { Vehicles } from "../pages/vehicles/vehicles";
import { PastAppointments } from "../components/PastAppointments";
import { Invoices } from "../pages/invoices/invoices";
import Profile from "../pages/profile/profile";
import { AppointmentDetailPage } from '../pages/AppointmentDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/appointment/:id" element={<AppointmentDetailPage />} />
      <Route path="/client" element={<ClientLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="service-history" element={<PastAppointments />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
