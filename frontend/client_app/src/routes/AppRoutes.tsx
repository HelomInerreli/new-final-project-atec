import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ClientMenu from "../components/ClientMenu";
import Dashboard from "../pages/dashboard/Dashboard";
import Appointments from "../pages/schedule/schedule";


const router = createBrowserRouter([
  {
    path: "/",
    element: <ClientMenu />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "schedule", element: <Schedule /> },
      { path: "vehicles", element: <Vehicles /> },
      { path: "new-service", element: <NewService /> },
      { path: "history", element: <History /> },
      { path: "invoices", element: <Invoices /> },
      { path: "profile", element: <Profile /> },
      { path: "logout", element: <Logout /> },
      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },
]);

export default router;
