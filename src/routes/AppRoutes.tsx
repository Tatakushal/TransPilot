import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import VehiclesPage from "@/pages/vehicles/VehiclesPage";
import DriversPage from "@/pages/drivers/DriversPage";
import TripsPage from "@/pages/trips/TripsPage";

import MaintenancePage from "@/pages/maintenance/MaintenancePage";
import FuelPage from "@/pages/fuel/FuelPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";

import LoginPage from "@/pages/auth/LoginPage";
import PrivacyPolicyPage from "@/pages/privacy/PrivacyPolicyPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/fuel" element={<ProtectedRoute><FuelPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
