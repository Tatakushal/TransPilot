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
import AdminPage from "@/pages/admin/AdminPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import PrivacyPolicyPage from "@/pages/privacy/PrivacyPolicyPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/privacy" element={<PrivacyPolicyPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/vehicles" element={<ProtectedRoute allowedRoles={["admin", "fleet-manager", "dispatcher"]}><VehiclesPage /></ProtectedRoute>} />
    <Route path="/drivers" element={<ProtectedRoute allowedRoles={["admin", "fleet-manager", "dispatcher", "safety-officer"]}><DriversPage /></ProtectedRoute>} />
    <Route path="/trips" element={<ProtectedRoute allowedRoles={["admin", "fleet-manager", "dispatcher"]}><TripsPage /></ProtectedRoute>} />
    <Route path="/maintenance" element={<ProtectedRoute allowedRoles={["admin", "fleet-manager"]}><MaintenancePage /></ProtectedRoute>} />
    <Route path="/fuel" element={<ProtectedRoute allowedRoles={["admin", "financial-analyst"]}><FuelPage /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin", "fleet-manager", "financial-analyst", "safety-officer"]}><ReportsPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></BrowserRouter>;
}
