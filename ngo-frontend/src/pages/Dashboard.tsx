import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/common/StatCard";

import NGOAdminDashboard from "./admin/NGOAdminDashboard";
import DonorDashboard from "./donor/DonorDashboard";
import CoordinatorDashboard from "./coordinator/CoordinatorDashboard";

import { getEvents } from "../api/events";

import {
  getMyRegistrations,
  type Registration,
} from "../api/registration";

import {
  getVolunteerProfile,
} from "../api/volunteers";

import {
  getMyCertificates,
} from "../api/certificates";

import type {
  Event,
} from "../types/event";

import type {
  Certificate,
} from "../types/certificate";


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}


function registrationColor(
  status: Registration["status"],
) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";

    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "CANCELLED":
      return "bg-slate-200 text-slate-600";

    default:
      return "bg-slate-200 text-slate-600";
  }
}


export default function Dashboard() {
  const { user } =
    useAuth();


  const [
    events,
    setEvents,
  ] = useState<Event[]>([]);

  const [
    registrations,
    setRegistrations,
  ] = useState<Registration[]>([]);

  const [
    certificates,
    setCertificates,
  ] = useState<Certificate[]>([]);

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    totalHours,
    setTotalHours,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadDashboard() {
      if (
        !user ||
        user.role !== "VOLUNTEER"
      ) {
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

        setEvents(
          eventsData,
        );

        setRegistrations(
          registrationsData,
        );

        setFirstName(
          profileData.first_name,
        );

        setTotalHours(
          Number(
            profileData.total_hours,
          ),
        );

        setCertificates(
          certificatesData,
        );

      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err,
        );

        setError(
          "Unable to load your dashboard. Please try again.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, [user]);


  /*
   * Role-specific dashboards.
   */

  if (
    user?.role ===
    "NGO_ADMIN"
  ) {
    return (
      <NGOAdminDashboard />
    );
  }


  if (
    user?.role ===
    "DONOR"
  ) {
    return (
      <DonorDashboard />
    );
  }


  if (
    user?.role ===
    "COORDINATOR"
  ) {
    return (
      <CoordinatorDashboard />
    );
  }


  const now =
    new Date();


  const upcomingEvents =
    events
      .filter(
        (event) =>
          new Date(
            event.start_date,
          ) > now &&
          event.status !==
            "CANCELLED" &&
          event.status !==
            "COMPLETED",
      )
      .sort(
        (a, b) =>
          new Date(
            a.start_date,
          ).getTime() -
          new Date(
            b.start_date,
          ).getTime(),
      )
      .slice(
        0,
        4,
      );


  const activeRegistrations =
    registrations.filter(
      (registration) =>
        registration.status ===
          "APPROVED" ||
        registration.status ===
          "PENDING",
    );


  return (
    <DashboardLayout>

      <div className="space-y-7">


        {/* Welcome */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-9">

          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-blue-400/10" />

          <div className="absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-teal-400/10" />


          <div className="relative">

            <div className="mb-3 inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Volunteer Workspace
            </div>


            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

              Welcome back
              {firstName
                ? `, ${firstName}`
                : ""}
              .

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Discover opportunities,
              manage your registrations,
              and keep track of the impact
              you are making.
            </p>


            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/dashboard/events"
                className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-600"
              >
                Browse Events
              </Link>


              <Link
                to="/dashboard/profile"
                className="rounded-xl border border-slate-500/50 bg-slate-700/40 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                View Profile
              </Link>

            </div>

          </div>

        </section>


        {/* Error */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-sm text-red-700">
            {error}
          </div>

        )}


        {/* Loading */}

        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              Loading dashboard...

            </div>

          </div>

        ) : (

          <>


            {/* Stats */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Available Events"
                value={
                  events.length
                }
              />

              <StatCard
                title="Active Registrations"
                value={
                  activeRegistrations.length
                }
              />

              <StatCard
                title="Volunteer Hours"
                value={
                  totalHours
                }
              />

              <StatCard
                title="Certificates"
                value={
                  certificates.length
                }
              />

            </div>


            {/* Main Grid */}

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">


              {/* Upcoming Events */}

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Opportunities
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Upcoming Events
                    </h2>

                  </div>


                  <Link
                    to="/dashboard/events"
                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                  >
                    View all →
                  </Link>

                </div>


                {upcomingEvents.length ===
                0 ? (

                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-[#eaf0f5] p-8 text-center">

                    <p className="font-medium text-slate-600">
                      No upcoming events
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      New opportunities will
                      appear here.
                    </p>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {upcomingEvents.map(
                      (event) => (

                        <Link
                          key={
                            event.id
                          }
                          to={`/dashboard/events/${event.id}`}
                          className="group flex flex-col justify-between gap-3 rounded-xl border border-slate-300/60 bg-[#eaf0f5] p-4 transition hover:border-blue-300 hover:bg-blue-50/50 sm:flex-row sm:items-center"
                        >

                          <div>

                            <p className="font-semibold text-slate-800 transition group-hover:text-blue-700">
                              {
                                event.title
                              }
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">

                              <span>
                                {
                                  event.location
                                }
                              </span>

                              <span>
                                {
                                  event.ngo_name
                                }
                              </span>

                            </div>

                          </div>


                          <div className="shrink-0 rounded-lg bg-[#f4f7fa] px-3 py-2 text-sm font-bold text-blue-600">
                            {formatDate(
                              event.start_date,
                            )}
                          </div>

                        </Link>

                      ),
                    )}

                  </div>

                )}

              </section>


              {/* Quick Actions */}

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                  Shortcuts
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Quick Actions
                </h2>


                <div className="mt-5 space-y-3">

                  <Link
                    to="/dashboard/registered-events"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    My Registrations
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/history"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Volunteer History
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/certificates"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Certificates
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/notifications"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Notifications
                    <span>→</span>
                  </Link>

                </div>

              </section>

            </div>


            {/* Recent Activity */}

            <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Activity
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Recent Registrations
                  </h2>

                </div>


                <Link
                  to="/dashboard/registered-events"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  View all →
                </Link>

              </div>


              {registrations.length ===
              0 ? (

                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-[#eaf0f5] p-7 text-center text-sm text-slate-500">
                  You have not registered
                  for an event yet.
                </div>

              ) : (

                <div className="mt-5 divide-y divide-slate-300/50">

                  {registrations
                    .slice(
                      0,
                      5,
                    )
                    .map(
                      (
                        registration,
                      ) => (

                        <div
                          key={
                            registration.id
                          }
                          className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                        >

                          <div>

                            <p className="font-semibold text-slate-800">
                              {
                                registration.event_title
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              Registered{" "}
                              {formatDate(
                                registration.registered_at,
                              )}
                            </p>

                          </div>


                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${registrationColor(
                              registration.status,
                            )}`}
                          >
                            {
                              registration.status
                            }
                          </span>

                        </div>

                      ),
                    )}

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </DashboardLayout>
  );
}