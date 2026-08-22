import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import NGOAdminDashboard from "./admin/NGOAdminDashboard";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/common/StatCard";

import { getEvents } from "../api/events";
import {
  getMyRegistrations,
  type Registration,
} from "../api/registration";
import { getVolunteerProfile } from "../api/volunteers";
import { getMyCertificates } from "../api/certificates";

import type { Event } from "../types/event";
import type { Certificate } from "../types/certificate";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);

  const [registrations, setRegistrations] = useState<
    Registration[]
  >([]);

  const [certificates, setCertificates] = useState<
    Certificate[]
  >([]);

  const [firstName, setFirstName] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      if (user.role !== "VOLUNTEER") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          eventsData,
          registrationsData,
          profileData,
          certificatesData,
        ] = await Promise.all([
          getEvents(),
          getMyRegistrations(),
          getVolunteerProfile(),
          getMyCertificates(),
        ]);

        setEvents(eventsData);

        setRegistrations(registrationsData);

        setFirstName(profileData.first_name);

        setCertificates(certificatesData);
      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err,
        );

        setError(
          "Failed to load dashboard data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (user?.role === "NGO_ADMIN") {
    return <NGOAdminDashboard />;
  }

  if (user && user.role !== "VOLUNTEER") {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold">
            Welcome, {user.first_name || user.username}
          </h1>
  
          <p className="mt-2 text-gray-600">
            Role: {user.role}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();

  /*
   * Events that are scheduled for the future.
   */
  const upcomingEvents = events
    .filter((event) => {
      return (
        new Date(event.start_date) > now &&
        event.status !== "CANCELLED" &&
        event.status !== "COMPLETED"
      );
    })
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() -
        new Date(b.start_date).getTime(),
    )
    .slice(0, 3);

  /*
   * Registrations that are still active.
   */
  const upcomingRegistrations = registrations.filter(
    (registration) =>
      registration.status === "APPROVED" ||
      registration.status === "PENDING",
  );

  /*
   * Completed registrations.
   */
  const completedRegistrations = registrations.filter(
    (registration) =>
      registration.status === "COMPLETED",
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* =========================
            Welcome Banner
        ========================== */}

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome back
            {firstName ? `, ${firstName}` : ""} 👋
          </h1>

          <p className="mt-2 text-blue-100">
            Ready for your next volunteer activity?
          </p>
        </div>

        {/* =========================
            Error
        ========================== */}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            Loading
        ========================== */}

        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-gray-600">
              Loading dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* =========================
                Statistics
            ========================== */}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Available Events"
                value={events.length}
              />

              <StatCard
                title="My Registrations"
                value={registrations.length}
              />

              <StatCard
                title="Upcoming Registrations"
                value={upcomingRegistrations.length}
              />

              <StatCard
                title="Certificates"
                value={certificates.length}
              />

            </div>

            {/* =========================
                Upcoming Events + Actions
            ========================== */}

            <div className="grid gap-6 lg:grid-cols-2">

              {/* Upcoming Events */}

              <div className="rounded-xl bg-white p-6 shadow-md">

                <div className="mb-4 flex items-center justify-between">

                  <h2 className="text-xl font-semibold">
                    Upcoming Events
                  </h2>

                  <Link
                    to="/dashboard/events"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </Link>

                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center">
                    <p className="text-gray-500">
                      No upcoming events available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {upcomingEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/dashboard/events/${event.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 transition hover:bg-gray-50"
                      >

                        <div>
                          <p className="font-medium">
                            {event.title}
                          </p>

                          <p className="text-sm text-gray-500">
                            {event.location}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-blue-600">
                          {formatDate(event.start_date)}
                        </span>

                      </Link>
                    ))}

                  </div>
                )}

              </div>

              {/* Quick Actions */}

              <div className="rounded-xl bg-white p-6 shadow-md">

                <h2 className="mb-4 text-xl font-semibold">
                  Quick Actions
                </h2>

                <div className="grid gap-3">

                  <Link
                    to="/dashboard/events"
                    className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    Browse Events
                  </Link>

                  <Link
                    to="/dashboard/profile"
                    className="rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 hover:bg-gray-200"
                  >
                    View Profile
                  </Link>

                  <Link
                    to="/dashboard/registered-events"
                    className="rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 hover:bg-gray-200"
                  >
                    My Registrations
                  </Link>

                  <Link
                    to="/dashboard/history"
                    className="rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 hover:bg-gray-200"
                  >
                    Volunteer History
                  </Link>

                  <Link
                    to="/dashboard/certificates"
                    className="rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 hover:bg-gray-200"
                  >
                    My Certificates
                  </Link>

                </div>

              </div>

            </div>

            {/* =========================
                Recent Activity
            ========================== */}

            <div className="rounded-xl bg-white p-6 shadow-md">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Recent Activity
                </h2>

                <Link
                  to="/dashboard/registered-events"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View registrations
                </Link>

              </div>

              {registrations.length === 0 ? (
                <p className="text-gray-500">
                  No activity yet.
                </p>
              ) : (
                <ul className="space-y-3 text-gray-700">

                  {registrations
                    .slice(0, 5)
                    .map((registration) => (
                      <li
                        key={registration.id}
                        className="rounded-lg border p-3"
                      >

                        <div className="flex flex-col justify-between gap-1 sm:flex-row">

                          <span>
                            Registered for{" "}
                            <span className="font-medium">
                              {registration.event_title}
                            </span>
                          </span>

                          <span className="text-sm text-gray-500">
                            {formatDate(
                              registration.registered_at,
                            )}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          Status:{" "}
                          {registration.status}
                        </p>

                      </li>
                    ))}

                </ul>
              )}

              {completedRegistrations.length > 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  You have completed{" "}
                  {completedRegistrations.length}{" "}
                  event
                  {completedRegistrations.length !== 1
                    ? "s"
                    : ""}.
                </p>
              )}

            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}