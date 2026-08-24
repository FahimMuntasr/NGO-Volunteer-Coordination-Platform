import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  useAuth,
} from "../../context/useAuth";

import {
  getEvents,
} from "../../api/events";

import {
  openEvent,
  startEvent,
  cancelEvent,
  completeEvent,
} from "../../api/admin";

import type {
  Event,
} from "../../types/event";


function statusClass(
  status:
    Event["status"],
) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-teal-100 text-teal-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}


export default function AdminEvents() {
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


  async function refreshEvents() {
    const data =
      await getEvents();

    setEvents(
      data.filter(
        (event) =>
          event.ngo ===
          user?.managed_ngo_id,
      ),
    );
  }


  useEffect(() => {
    let cancelled =
      false;

    getEvents()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setEvents(
          data.filter(
            (event) =>
              event.ngo ===
              user?.managed_ngo_id,
          ),
        );
      })
      .catch((err) => {
        console.error(err);

        if (!cancelled) {
          setError(
            "Unable to load events.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };

  }, [
    user?.managed_ngo_id,
  ]);


  async function runAction(
    eventId: number,
    action:
      | "open"
      | "start"
      | "cancel"
      | "complete",
  ) {
    try {
      setWorkingId(
        eventId,
      );

      setError("");

      if (
        action ===
        "open"
      ) {
        await openEvent(
          eventId,
        );
      }

      if (
        action ===
        "start"
      ) {
        await startEvent(
          eventId,
        );
      }

      if (
        action ===
        "cancel"
      ) {
        await cancelEvent(
          eventId,
        );
      }

      if (
        action ===
        "complete"
      ) {
        await completeEvent(
          eventId,
        );
      }

      await refreshEvents();

    } catch (err) {
      console.error(err);

      setError(
        "Unable to update event.",
      );

    } finally {
      setWorkingId(
        null,
      );
    }
  }


  return (
    <DashboardLayout>

      <div className="space-y-6">


        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Event Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Events
            </h1>

            <p className="mt-1 text-slate-500">
              Manage your NGO's event
              lifecycle.
            </p>
          </div>


          <Link
            to="/dashboard/admin/events/create"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white"
          >
            + Create Event
          </Link>

        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading events...
          </div>

        ) : events.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-10 text-center">
            No events have been created yet.
          </div>

        ) : (

          <div className="space-y-4">

            {events.map(
              (event) => (

                <article
                  key={
                    event.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          event.title
                        }
                      </h2>

                      <p className="mt-1 text-slate-500">
                        {
                          event.location
                        }
                      </p>

                    </div>


                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        event.status,
                      )}`}
                    >
                      {
                        event.status
                      }
                    </span>

                  </div>


                  <div className="mt-5 flex flex-wrap gap-3">

                    <Link
                      to={`/dashboard/events/${event.id}`}
                      className="rounded-xl border border-slate-300 bg-[#eaf0f5] px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      View Details
                    </Link>


                    {event.status ===
                      "DRAFT" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            workingId ===
                            event.id
                          }
                          onClick={() =>
                            runAction(
                              event.id,
                              "open",
                            )
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Open Event
                        </button>

                        <button
                          type="button"
                          disabled={
                            workingId ===
                            event.id
                          }
                          onClick={() =>
                            runAction(
                              event.id,
                              "cancel",
                            )
                          }
                          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}


                    {event.status ===
                      "OPEN" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            workingId ===
                            event.id
                          }
                          onClick={() =>
                            runAction(
                              event.id,
                              "start",
                            )
                          }
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Start Event
                        </button>

                        <button
                          type="button"
                          disabled={
                            workingId ===
                            event.id
                          }
                          onClick={() =>
                            runAction(
                              event.id,
                              "cancel",
                            )
                          }
                          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}


                    {event.status ===
                      "IN_PROGRESS" && (

                      <button
                        type="button"
                        disabled={
                          workingId ===
                          event.id
                        }
                        onClick={() =>
                          runAction(
                            event.id,
                            "complete",
                          )
                        }
                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Complete Event
                      </button>

                    )}

                  </div>

                </article>

              ),
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}