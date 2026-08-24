import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";

import {
  useAuth,
} from "../../context/useAuth";

import {
  getEvents,
} from "../../api/events";

import type {
  Event,
} from "../../types/event";


export default function CoordinatorDashboard() {
  const { user } =
    useAuth();


  const [
    events,
    setEvents,
  ] =
    useState<Event[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEvents();

        setEvents(
          data,
        );

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load coordinator dashboard.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, []);


  const openEvents =
    events.filter(
      (event) =>
        event.status === "OPEN",
    );


  const inProgressEvents =
    events.filter(
      (event) =>
        event.status ===
        "IN_PROGRESS",
    );


  const completedEvents =
    events.filter(
      (event) =>
        event.status ===
        "COMPLETED",
    );


  const activeEvents =
    events.filter(
      (event) =>
        event.status !==
          "COMPLETED" &&
        event.status !==
          "CANCELLED",
    );


  const recentEvents =
    events.slice(
      0,
      5,
    );


  return (
    <DashboardLayout>

      <div className="space-y-7">


        {/* Welcome */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-9">

          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-blue-400/10" />

          <div className="absolute -bottom-24 right-28 h-52 w-52 rounded-full bg-teal-400/10" />


          <div className="relative">

            <div className="mb-3 inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Coordinator Workspace
            </div>


            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

              Welcome
              {user?.first_name
                ? `, ${user.first_name}`
                : ""}
              .

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage assigned events,
              organize volunteer teams,
              and record attendance.
            </p>


            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/dashboard/coordinator/events"
                className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                My Events
              </Link>


              <Link
                to="/dashboard/coordinator/attendance"
                className="rounded-xl border border-slate-500/50 bg-slate-700/40 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Mark Attendance
              </Link>

            </div>

          </div>

        </section>


        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
          </div>

        )}


        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              Loading coordinator
              dashboard...

            </div>

          </div>

        ) : (

          <>


            {/* Stats */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Assigned Events"
                value={
                  events.length
                }
              />

              <StatCard
                title="Active Events"
                value={
                  activeEvents.length
                }
              />

              <StatCard
                title="In Progress"
                value={
                  inProgressEvents.length
                }
              />

              <StatCard
                title="Completed"
                value={
                  completedEvents.length
                }
              />

            </div>


            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">


              {/* Events */}

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Assignments
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Assigned Events
                    </h2>

                  </div>


                  <Link
                    to="/dashboard/coordinator/events"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View all →
                  </Link>

                </div>


                {recentEvents.length ===
                0 ? (

                  <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-[#eaf0f5] p-8 text-center">

                    <p className="font-medium text-slate-600">
                      No events assigned
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Assigned events will
                      appear here.
                    </p>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {recentEvents.map(
                      (event) => (

                        <div
                          key={
                            event.id
                          }
                          className="flex flex-col justify-between gap-3 rounded-xl border border-slate-300/60 bg-[#eaf0f5] p-4 sm:flex-row sm:items-center"
                        >

                          <div>

                            <p className="font-semibold text-slate-800">
                              {
                                event.title
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                event.ngo_name
                              }
                              {" · "}
                              {
                                event.location
                              }
                            </p>

                          </div>


                          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            {
                              event.status
                            }
                          </span>

                        </div>

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
                    to="/dashboard/coordinator/teams"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Manage Teams
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/coordinator/attendance"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Mark Attendance
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/coordinator/profile"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    My Profile
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/notifications"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Notifications
                    <span>→</span>
                  </Link>

                </div>

              </section>

            </div>


            {/* Event Summary */}

            <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Workload
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Event Status
              </h2>


              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl bg-blue-100/60 p-5">

                  <p className="text-sm font-semibold text-blue-700">
                    Open
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-800">
                    {
                      openEvents.length
                    }
                  </p>

                </div>


                <div className="rounded-xl bg-teal-100/60 p-5">

                  <p className="text-sm font-semibold text-teal-700">
                    In Progress
                  </p>

                  <p className="mt-2 text-3xl font-bold text-teal-800">
                    {
                      inProgressEvents.length
                    }
                  </p>

                </div>


                <div className="rounded-xl bg-emerald-100/60 p-5">

                  <p className="text-sm font-semibold text-emerald-700">
                    Completed
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-800">
                    {
                      completedEvents.length
                    }
                  </p>

                </div>

              </div>

            </section>

          </>

        )}

      </div>

    </DashboardLayout>
  );
}