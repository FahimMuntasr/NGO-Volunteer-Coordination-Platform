import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  useAuth,
} from "../../context/useAuth";

import {
  getEvents,
} from "../../api/events";

import {
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../../api/eventManagement";

import type {
  Event,
  EventRegistration,
} from "../../types/event";


function statusClass(
  status: string,
) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "PENDING":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-200 text-slate-700";
  }
}


export default function AdminRegistrations() {
  const {
    user,
  } =
    useAuth();

  const [
    events,
    setEvents,
  ] =
    useState<Event[]>([]);

  const [
    selectedEventId,
    setSelectedEventId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    registrations,
    setRegistrations,
  ] =
    useState<
      EventRegistration[]
    >([]);

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

  const [
    workingId,
    setWorkingId,
  ] =
    useState<number | null>(
      null,
    );


  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);

        const data =
          await getEvents();

        const own =
          data.filter(
            (event) =>
              event.ngo ===
              user?.managed_ngo_id,
          );

        setEvents(own);

        if (
          own.length >
          0
        ) {
          setSelectedEventId(
            own[0].id,
          );
        }

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load events.",
        );

      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadEvents();
    }

  }, [user]);


  useEffect(() => {
    async function load() {
      if (
        !selectedEventId
      ) {
        setRegistrations(
          [],
        );

        return;
      }

      try {
        setLoading(true);

        const data =
          await getEventRegistrations(
            selectedEventId,
          );

        setRegistrations(
          data,
        );

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load registrations.",
        );

      } finally {
        setLoading(false);
      }
    }

    load();

  }, [
    selectedEventId,
  ]);


  async function handleApprove(
    id: number,
  ) {
    try {
      setWorkingId(id);

      const updated =
        await approveRegistration(
          id,
        );

      setRegistrations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      );

    } catch {
      setError(
        "Unable to approve registration.",
      );

    } finally {
      setWorkingId(null);
    }
  }


  async function handleReject(
    id: number,
  ) {
    try {
      setWorkingId(id);

      const updated =
        await rejectRegistration(
          id,
        );

      setRegistrations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      );

    } catch {
      setError(
        "Unable to reject registration.",
      );

    } finally {
      setWorkingId(null);
    }
  }


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Volunteer Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Registrations
          </h1>

          <p className="mt-1 text-slate-500">
            Review volunteer registration
            requests for your events.
          </p>
        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {events.length >
          0 && (

          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-5">

            <label className="text-sm font-semibold text-slate-700">
              Select Event
            </label>

            <select
              value={
                selectedEventId ??
                ""
              }
              onChange={(
                event,
              ) =>
                setSelectedEventId(
                  Number(
                    event
                      .target
                      .value,
                  ),
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
            >
              {events.map(
                (event) => (
                  <option
                    key={
                      event.id
                    }
                    value={
                      event.id
                    }
                  >
                    {
                      event.title
                    }
                    {" — "}
                    {
                      event.status
                    }
                  </option>
                ),
              )}
            </select>

          </section>

        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading...
          </div>

        ) : registrations.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-8 text-center text-slate-500">
            No registrations found for
            this event.
          </div>

        ) : (

          <div className="space-y-4">

            {registrations.map(
              (registration) => (

                <article
                  key={
                    registration.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>

                      <h2 className="text-lg font-bold text-slate-900">
                        {
                          registration.volunteer_username
                        }
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Registration #
                        {
                          registration.id
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(
                          registration.registered_at,
                        ).toLocaleString()}
                      </p>

                    </div>


                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        registration.status,
                      )}`}
                    >
                      {
                        registration.status
                      }
                    </span>

                  </div>


                  {registration.status ===
                    "PENDING" && (

                    <div className="mt-5 flex gap-3">

                      <button
                        type="button"
                        disabled={
                          workingId ===
                          registration.id
                        }
                        onClick={() =>
                          handleApprove(
                            registration.id,
                          )
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                      >
                        Approve
                      </button>


                      <button
                        type="button"
                        disabled={
                          workingId ===
                          registration.id
                        }
                        onClick={() =>
                          handleReject(
                            registration.id,
                          )
                        }
                        className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>

                    </div>

                  )}

                </article>

              ),
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}