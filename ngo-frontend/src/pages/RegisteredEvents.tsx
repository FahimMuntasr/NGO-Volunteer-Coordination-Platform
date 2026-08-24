import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getMyRegistrations,
  type Registration,
  type RegistrationStatus,
} from "../api/registration";


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}


function getStatusClass(
  status: RegistrationStatus,
) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";

    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "CANCELLED":
      return "bg-slate-200 text-slate-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-200 text-slate-700";
  }
}


export default function RegisteredEvents() {
  const [
    registrations,
    setRegistrations,
  ] =
    useState<Registration[]>([]);

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
    async function loadRegistrations() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyRegistrations();

        setRegistrations(
          data,
        );

      } catch (err) {
        console.error(
          "Failed to load registrations:",
          err,
        );

        setError(
          "Failed to load your registrations. Please try again.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, []);


  const approved =
    registrations.filter(
      (item) =>
        item.status ===
        "APPROVED",
    ).length;


  const pending =
    registrations.filter(
      (item) =>
        item.status ===
        "PENDING",
    ).length;


  return (
    <DashboardLayout>

      <div className="space-y-6">


        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-400/10" />


          <div className="relative">

            <div className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Event Participation
            </div>


            <h1 className="mt-3 text-3xl font-bold">
              My Registrations
            </h1>


            <p className="mt-2 text-slate-300">
              Track your registration
              status for volunteer events.
            </p>

          </div>

        </section>


        {/* Stats */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-5">

            <p className="text-sm font-semibold text-slate-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                registrations.length
              }
            </p>

          </div>


          <div className="rounded-2xl bg-emerald-100/60 p-5">

            <p className="text-sm font-semibold text-emerald-700">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-800">
              {approved}
            </p>

          </div>


          <div className="rounded-2xl bg-amber-100/60 p-5">

            <p className="text-sm font-semibold text-amber-700">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {pending}
            </p>

          </div>

        </div>


        {/* Error */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
          </div>

        )}


        {/* Loading */}

        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              Loading your registrations...

            </div>

          </div>

        ) : registrations.length ===
          0 ? (

          /* Empty */

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-10 text-center">

            <h2 className="text-xl font-bold text-slate-800">
              No registrations yet
            </h2>


            <p className="mt-2 text-slate-500">
              Browse available events to
              find your next volunteer
              opportunity.
            </p>


            <Link
              to="/dashboard/events"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Events
            </Link>

          </div>

        ) : (

          /* Registrations */

          <div className="grid gap-4">

            {registrations.map(
              (registration) => (

                <article
                  key={
                    registration.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">


                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          registration.event_title
                        }
                      </h2>


                      <p className="mt-1 text-sm text-slate-500">
                        Registration #
                        {
                          registration.id
                        }
                      </p>

                    </div>


                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        registration.status,
                      )}`}
                    >
                      {
                        registration.status
                      }
                    </span>

                  </div>


                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">


                    {/* Registered */}

                    <div className="rounded-xl bg-[#eaf0f5] p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registered
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDate(
                          registration.registered_at,
                        )}
                      </p>

                    </div>


                    {/* Approved */}

                    <div className="rounded-xl bg-[#eaf0f5] p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Approved
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {registration.approved_at
                          ? formatDate(
                              registration.approved_at,
                            )
                          : "—"}
                      </p>

                    </div>


                    {/* Attendance */}

                    <div className="rounded-xl bg-[#eaf0f5] p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attendance
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {
                          registration.attendance_status
                        }
                      </p>

                    </div>


                    {/* Hours */}

                    <div className="rounded-xl bg-[#eaf0f5] p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Hours Earned
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {
                          registration.hours_earned
                        }
                      </p>

                    </div>

                  </div>


                  <Link
                    to={`/dashboard/events/${registration.event}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                  >
                    View Event
                    <span>
                      →
                    </span>
                  </Link>

                </article>

              ),
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}