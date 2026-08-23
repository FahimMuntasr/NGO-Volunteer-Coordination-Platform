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
import AdminEvents from "../pages/admin/AdminEvents";
import CreateEvent from "../pages/admin/CreateEvent";
import NGOVerification from "../pages/admin/NGOVerification";
import AdminRegistrations from "../pages/admin/AdminRegistrations";
import AdminDonations from "../pages/admin/AdminDonations";
import AssignCoordinator from "../pages/admin/AssignCoordinator";
import CoordinatorEvents from "../pages/coordinator/CoordinatorEvents";
import CoordinatorTeams from "../pages/coordinator/CoordinatorTeams";
import CoordinatorAttendance from "../pages/coordinator/CoordinatorAttendance";
import Register from "../pages/Register";
import Notifications from "../pages/Notifications";
import VolunteerRankings from "../pages/admin/VolunteerRankings";

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
          path="/register"
          element={<Register />}
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
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
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
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registered-events"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <RegisteredEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <VolunteerHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/certificates"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
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

        <Route
          path="/dashboard/admin/events"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <AdminEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/events/create"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/verification"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <NGOVerification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/registrations"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <AdminRegistrations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/donations"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <AdminDonations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/coordinators"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <AssignCoordinator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/rankings"
          element={
            <ProtectedRoute
              allowedRoles={["NGO_ADMIN"]}
            >
              <VolunteerRankings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/coordinator/events"
          element={
            <ProtectedRoute
              allowedRoles={["COORDINATOR"]}
            >
              <CoordinatorEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/coordinator/teams"
          element={
            <ProtectedRoute
              allowedRoles={["COORDINATOR"]}
            >
              <CoordinatorTeams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/coordinator/attendance"
          element={
            <ProtectedRoute
              allowedRoles={["COORDINATOR"]}
            >
              <CoordinatorAttendance />
            </ProtectedRoute>
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