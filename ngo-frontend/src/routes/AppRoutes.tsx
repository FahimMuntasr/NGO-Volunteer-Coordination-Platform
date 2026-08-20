import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Profile from "../pages/Profile";
import RegisteredEvents from "../pages/RegisteredEvents";
import VolunteerHistory from "../pages/VolunteerHistory";
import Certificates from "../pages/Certificates";
import NotFound from "../pages/NotFound";
import CertificateVerification from "../pages/CertificateVerification";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Public Routes
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/certificate/verify/:verificationCode"
          element={<CertificateVerification />}
        />

        {/* =========================
            Protected Routes
        ========================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/events/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registered-events"
          element={
            <ProtectedRoute>
              <RegisteredEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute>
              <VolunteerHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />

        {/* =========================
            Default Route
        ========================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* =========================
            404
        ========================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}