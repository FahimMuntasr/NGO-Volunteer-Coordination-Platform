import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";


// ================================
// PUBLIC
// ================================

import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import CertificateVerification from "../pages/CertificateVerification";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";


// ================================
// SHARED
// ================================

import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Notifications from "../pages/Notifications";


// ================================
// VOLUNTEER
// ================================

import Profile from "../pages/Profile";
import RegisteredEvents from "../pages/RegisteredEvents";
import VolunteerHistory from "../pages/VolunteerHistory";
import Certificates from "../pages/Certificates";


// ================================
// NGO ADMIN
// ================================

import NGOAdminDashboard from "../pages/admin/NGOAdminDashboard";
import AdminEvents from "../pages/admin/AdminEvents";
import CreateEvent from "../pages/admin/CreateEvent";
import AdminRegistrations from "../pages/admin/AdminRegistrations";
import AssignCoordinator from "../pages/admin/AssignCoordinator";
import AdminDonations from "../pages/admin/AdminDonations";
import NGOVerification from "../pages/admin/NGOVerification";
import VolunteerRankings from "../pages/admin/VolunteerRankings";
import NGOProfile from "../pages/admin/NGOProfile";


// ================================
// COORDINATOR
// ================================

import CoordinatorDashboard from "../pages/coordinator/CoordinatorDashboard";
import CoordinatorEvents from "../pages/coordinator/CoordinatorEvents";
import CoordinatorTeams from "../pages/coordinator/CoordinatorTeams";
import CoordinatorAttendance from "../pages/coordinator/CoordinatorAttendance";
import CoordinatorProfile from "../pages/coordinator/CoordinatorProfile";


// ================================
// DONOR
// ================================

import DonorDashboard from "../pages/donor/DonorDashboard";
import DonorNGOs from "../pages/donor/DonorNGOs";
import DonorDonate from "../pages/donor/DonorDonate";
import DonationHistory from "../pages/donor/DonationHistory";
import DonorProfile from "../pages/donor/DonorProfile";


export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>


        {/* =================================
            PUBLIC ROUTES
        ================================= */}


        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/register"
          element={
            <Register />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        <Route
          path="/reset-password/:uid/:token"
          element={
            <ResetPassword />
          }
        />


        <Route
          path="/certificate/verify/:verificationCode"
          element={
            <CertificateVerification />
          }
        />


        {/* =================================
            MAIN DASHBOARD
        ================================= */}


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================
            SHARED ROUTES
        ================================= */}


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


        {/* =================================
            VOLUNTEER ROUTES
        ================================= */}


        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "VOLUNTEER",
              ]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/registered-events"
          element={
            <ProtectedRoute
              allowedRoles={[
                "VOLUNTEER",
              ]}
            >
              <RegisteredEvents />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute
              allowedRoles={[
                "VOLUNTEER",
              ]}
            >
              <VolunteerHistory />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/certificates"
          element={
            <ProtectedRoute
              allowedRoles={[
                "VOLUNTEER",
              ]}
            >
              <Certificates />
            </ProtectedRoute>
          }
        />


        {/* =================================
            NGO ADMIN ROUTES
        ================================= */}


        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <NGOAdminDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/events"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <AdminEvents />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/events/create"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <CreateEvent />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/registrations"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <AdminRegistrations />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/coordinators"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <AssignCoordinator />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/donations"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <AdminDonations />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/verification"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <NGOVerification />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/rankings"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <VolunteerRankings />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/admin/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "NGO_ADMIN",
              ]}
            >
              <NGOProfile />
            </ProtectedRoute>
          }
        />


        {/* =================================
            COORDINATOR ROUTES
        ================================= */}


        <Route
          path="/dashboard/coordinator"
          element={
            <ProtectedRoute
              allowedRoles={[
                "COORDINATOR",
              ]}
            >
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/coordinator/events"
          element={
            <ProtectedRoute
              allowedRoles={[
                "COORDINATOR",
              ]}
            >
              <CoordinatorEvents />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/coordinator/teams"
          element={
            <ProtectedRoute
              allowedRoles={[
                "COORDINATOR",
              ]}
            >
              <CoordinatorTeams />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/coordinator/attendance"
          element={
            <ProtectedRoute
              allowedRoles={[
                "COORDINATOR",
              ]}
            >
              <CoordinatorAttendance />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/coordinator/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "COORDINATOR",
              ]}
            >
              <CoordinatorProfile />
            </ProtectedRoute>
          }
        />


        {/* =================================
            DONOR ROUTES
        ================================= */}


        <Route
          path="/dashboard/donor"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DONOR",
              ]}
            >
              <DonorDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/donor/ngos"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DONOR",
              ]}
            >
              <DonorNGOs />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/donor/donate"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DONOR",
              ]}
            >
              <DonorDonate />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/donor/history"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DONOR",
              ]}
            >
              <DonationHistory />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/donor/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DONOR",
              ]}
            >
              <DonorProfile />
            </ProtectedRoute>
          }
        />


        {/* =================================
            ROOT
        ================================= */}


        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =================================
            404
        ================================= */}


        <Route
          path="*"
          element={
            <NotFound />
          }
        />


      </Routes>

    </BrowserRouter>
  );
}