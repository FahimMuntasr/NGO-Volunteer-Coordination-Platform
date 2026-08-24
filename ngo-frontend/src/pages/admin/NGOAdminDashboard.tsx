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
  getNGODashboard,
  type NGODashboardData,
} from "../../api/admin";


export default function NGOAdminDashboard() {
  const { user } =
    useAuth();

  const [
    data,
    setData,
  ] =
    useState<NGODashboardData | null>(
      null,
    );

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
      if (
        !user?.managed_ngo_id
      ) {
        setError(
          "This account is not connected to an NGO.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const dashboardData =
          await getNGODashboard(
            user.managed_ngo_id,
          );

        setData(
          dashboardData,
        );

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load NGO dashboard.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, [user]);


  return (
    <DashboardLayout>

      <div className="space-y-7">


        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-9">

          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-teal-400/10" />

          <div className="absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-blue-400/10" />


          <div className="relative">

            <div className="mb-3 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200">
              NGO Administrator Workspace
            </div>


            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

              {user?.managed_ngo_name ??
                "NGO Dashboard"}

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage events,
              registrations,
              coordinators, donations,
              and your organization's
              volunteer activity.
            </p>


            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/dashboard/admin/events/create"
                className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Create Event
              </Link>


              <Link
                to="/dashboard/admin/profile"
                className="rounded-xl border border-slate-500/50 bg-slate-700/40 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                NGO Profile
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

              Loading NGO dashboard...

            </div>

          </div>

        ) : data ? (

          <>


            {/* Stats */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Events"
                value={
                  data.events.total
                }
              />

              <StatCard
                title="Registrations"
                value={
                  data.registrations.total
                }
              />

              <StatCard
                title="Donations"
                value={
                  data.donations.count
                }
              />

              <StatCard
                title="Open Events"
                value={
                  data.events.open
                }
              />

            </div>


            {/* Event Status */}

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">


              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    Overview
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Event Status
                  </h2>

                </div>


                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">


                  <div className="rounded-xl bg-[#eaf0f5] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Draft
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {
                        data.events.draft
                      }
                    </p>

                  </div>


                  <div className="rounded-xl bg-blue-100/60 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Open
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-700">
                      {
                        data.events.open
                      }
                    </p>

                  </div>


                  <div className="rounded-xl bg-teal-100/60 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                      Active
                    </p>

                    <p className="mt-2 text-2xl font-bold text-teal-700">
                      {
                        data.events.in_progress
                      }
                    </p>

                  </div>


                  <div className="rounded-xl bg-emerald-100/60 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Completed
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                      {
                        data.events.completed
                      }
                    </p>

                  </div>


                  <div className="rounded-xl bg-red-100/50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Cancelled
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-700">
                      {
                        data.events.cancelled
                      }
                    </p>

                  </div>

                </div>

              </section>


              {/* Quick Actions */}

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                  Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Quick Actions
                </h2>


                <div className="mt-5 space-y-3">

                  <Link
                    to="/dashboard/admin/events"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Manage Events
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/admin/registrations"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Registrations
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/admin/coordinators"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Assign Coordinators
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/admin/donations"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Donations
                    <span>→</span>
                  </Link>

                </div>

              </section>

            </div>


            {/* Other Tools */}

            <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Organization
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  NGO Tools
                </h2>

              </div>


              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <Link
                  to="/dashboard/admin/rankings"
                  className="rounded-xl border border-slate-300/60 bg-[#eaf0f5] p-5 transition hover:border-blue-300 hover:bg-blue-50/50"
                >

                  <p className="font-bold text-slate-800">
                    Volunteer Rankings
                  </p>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Review volunteer
                    performance using your
                    ranking strategies.
                  </p>

                </Link>


                <Link
                  to="/dashboard/admin/verification"
                  className="rounded-xl border border-slate-300/60 bg-[#eaf0f5] p-5 transition hover:border-teal-300 hover:bg-teal-50/50"
                >

                  <p className="font-bold text-slate-800">
                    NGO Verification
                  </p>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Review your organization's
                    verification information.
                  </p>

                </Link>


                <Link
                  to="/dashboard/notifications"
                  className="rounded-xl border border-slate-300/60 bg-[#eaf0f5] p-5 transition hover:border-blue-300 hover:bg-blue-50/50"
                >

                  <p className="font-bold text-slate-800">
                    Notifications
                  </p>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Review recent registration
                    and event activity.
                  </p>

                </Link>

              </div>

            </section>

          </>

        ) : null}

      </div>

    </DashboardLayout>
  );
}