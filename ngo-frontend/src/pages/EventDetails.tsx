import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getEvent,
  registerForEvent,
} from "../api/events";

import {
  getMyRegistrations,
  type Registration,
} from "../api/registration";

import {
  useAuth,
} from "../context/useAuth";

import type {
  Event,
} from "../types/event";

import DashboardLayout from "../layouts/DashboardLayout";


function formatDateTime(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}


function registrationStatusClass(
  status: Registration["status"],
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


function eventStatusClass(
  status: Event["status"],
) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-slate-200 text-slate-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "DRAFT":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-200 text-slate-700";
  }
}


export default function EventDetails() {
  const {
    id,
  } =
    useParams<{
      id: string;
    }>();

  const {
    user,
  } =
    useAuth();


  const [
    event,
    setEvent,
  ] =
    useState<Event | null>(
      null,
    );

  const [
    registration,
    setRegistration,
  ] =
    useState<Registration | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    registering,
    setRegistering,
  ] =
    useState(false);

  const [
    eventError,
    setEventError,
  ] =
    useState("");

  const [
    registrationSuccess,
    setRegistrationSuccess,
  ] =
    useState("");

  const [
    registrationError,
    setRegistrationError,
  ] =
    useState("");


  const isVolunteer =
    user?.role ===
    "VOLUNTEER";


  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setEventError("");
        setRegistrationError("");

        const eventData =
          await getEvent(
            Number(id),
          );

        setEvent(
          eventData,
        );


        if (isVolunteer) {
          try {
            const registrationsData =
              await getMyRegistrations();

            const existingRegistration =
              registrationsData.find(
                (item) =>
                  item.event ===
                  Number(id),
              );

            setRegistration(
              existingRegistration ??
                null,
            );

          } catch (err) {
            console.error(
              "Failed to load registration:",
              err,
            );

            setRegistration(
              null,
            );

            setRegistrationError(
              "Unable to load your registration status.",
            );
          }

        } else {
          setRegistration(
            null,
          );
        }

      } catch (err) {
        console.error(
          "Failed to load event:",
          err,
        );

        setEvent(
          null,
        );

        setEventError(
          "Event not found or you do not have permission to view it.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadEvent();

  }, [
    id,
    isVolunteer,
  ]);


  async function handleRegister() {
    if (
      !id ||
      !isVolunteer
    ) {
      return;
    }

    try {
      setRegistering(true);
      setRegistrationSuccess("");
      setRegistrationError("");

      const newRegistration =
        await registerForEvent(
          Number(id),
        );

      setRegistration(
        newRegistration,
      );

      setRegistrationSuccess(
        "You have successfully registered for this event.",
      );

    } catch (
      error: unknown
    ) {
      if (
        error &&
        typeof error ===
          "object" &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response;

        setRegistrationError(
          response?.data
            ?.detail ||
            "Failed to register for this event.",
        );

      } else {
        setRegistrationError(
          "Failed to register for this event.",
        );
      }

    } finally {
      setRegistering(false);
    }
  }


  if (loading) {
    return (
      <DashboardLayout>

        <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

          <div className="flex items-center gap-3 text-slate-500">

            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

            Loading event...

          </div>

        </div>

      </DashboardLayout>
    );
  }


  if (!event) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-6 text-red-700">
            {eventError ||
              "Event could not be loaded."}
          </div>


          <Link
            to="/dashboard/events"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Events
          </Link>

        </div>

      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-5xl space-y-5">


        {/* Back */}

        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          ← Back to Events
        </Link>


        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-9">

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-400/10" />

          <div className="absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-teal-400/10" />


          <div className="relative">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

              <div>

                <p className="text-sm font-semibold text-blue-300">
                  {
                    event.ngo_name
                  }
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {
                    event.title
                  }
                </h1>

              </div>


              <span
                className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${eventStatusClass(
                  event.status,
                )}`}
              >
                {
                  event.status
                }
              </span>

            </div>


            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              {
                event.description
              }
            </p>

          </div>

        </section>


        {/* Details */}

        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Event Information
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Details
          </h2>


          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">


            <div className="rounded-xl bg-[#eaf0f5] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {
                  event.location
                }
              </p>

            </div>


            <div className="rounded-xl bg-[#eaf0f5] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Capacity
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {
                  event.capacity_mode === "UNLIMITED"
                    ? "Unlimited"
                    : event.volunteer_capacity
                }{" "}
                volunteers
              </p>

            </div>


            <div className="rounded-xl bg-[#eaf0f5] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {
                  event.status
                }
              </p>

            </div>


            <div className="rounded-xl bg-[#eaf0f5] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Starts
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {formatDateTime(
                  event.start_date,
                )}
              </p>

            </div>


            <div className="rounded-xl bg-[#eaf0f5] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ends
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {formatDateTime(
                  event.end_date,
                )}
              </p>

            </div>


            <div className="rounded-xl bg-[#eaf0f5] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Registration Deadline
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {formatDateTime(
                  event.registration_deadline,
                )}
              </p>

            </div>

          </div>

        </section>


        {/* Skills */}

        {event.required_skills.length >
          0 && (

          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
              Requirements
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Required Skills
            </h2>


            <div className="mt-4 flex flex-wrap gap-2">

              {event.required_skills.map(
                (skill) => (

                  <span
                    key={
                      skill
                    }
                    className="rounded-full border border-blue-200 bg-blue-100/60 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {
                      skill
                    }
                  </span>

                ),
              )}

            </div>

          </section>

        )}


        {/* Volunteer Registration */}

        {isVolunteer && (

          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Registration
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Your Registration
            </h2>


            {registrationSuccess && (

              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-100/60 p-4 text-sm font-medium text-emerald-700">
                ✓ {
                  registrationSuccess
                }
              </div>

            )}


            {registrationError && (

              <div className="mt-5 rounded-xl border border-red-200 bg-red-100/60 p-4 text-sm text-red-700">
                {
                  registrationError
                }
              </div>

            )}


            {registration ? (

              <div className="mt-5 rounded-2xl border border-slate-300/60 bg-[#eaf0f5] p-5">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <p className="font-bold text-slate-800">
                      You're registered
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Registration #
                      {
                        registration.id
                      }
                    </p>

                  </div>


                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${registrationStatusClass(
                      registration.status,
                    )}`}
                  >
                    {
                      registration.status
                    }
                  </span>

                </div>


                <div className="mt-5 grid gap-4 border-t border-slate-300/60 pt-4 sm:grid-cols-2">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registered
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatDateTime(
                        registration
                          .registered_at,
                      )}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Attendance
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {
                        registration
                          .attendance_status
                      }
                    </p>

                  </div>

                </div>


                <Link
                  to="/dashboard/registered-events"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  View my registrations →
                </Link>

              </div>

            ) : (

              <div className="mt-5">

                <p className="mb-4 text-sm text-slate-500">
                  {event.status ===
                  "OPEN"
                    ? "Registration is currently open for this event."
                    : "Registration is not currently available for this event."}
                </p>


                <button
                  type="button"
                  onClick={
                    handleRegister
                  }
                  disabled={
                    event.status !==
                      "OPEN" ||
                    registering
                  }
                  className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {registering
                    ? "Registering..."
                    : event.status ===
                        "OPEN"
                      ? "Register for Event"
                      : "Registration Unavailable"}
                </button>

              </div>

            )}

          </section>

        )}


        {/* Other Roles */}

        {!isVolunteer && (

          <section className="rounded-2xl border border-slate-300/60 bg-[#e3eaf1] p-5">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                i
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  Event access
                </p>

                <p className="mt-1 text-sm text-slate-600">

                  {user?.role ===
                    "NGO_ADMIN" &&
                    "You are viewing this event as an NGO Administrator."}

                  {user?.role ===
                    "COORDINATOR" &&
                    "You are viewing this event as its assigned Coordinator."}

                  {user?.role ===
                    "DONOR" &&
                    "You are viewing this event as a Donor."}

                </p>

              </div>

            </div>

          </section>

        )}

      </div>

    </DashboardLayout>
  );
}