import {
    useEffect,
    useState,
  } from "react";
  
  import { Link } from "react-router-dom";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { useAuth } from "../../context/useAuth";
  
  import { getEvents } from "../../api/events";
  
  import {
    openEvent,
    startEvent,
    cancelEvent,
    completeEvent,
  } from "../../api/admin";
  
  import type { Event } from "../../types/event";
  
  export default function AdminEvents() {
    const { user } = useAuth();
  
    const [events, setEvents] =
      useState<Event[]>([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [workingId, setWorkingId] =
      useState<number | null>(null);
  
    useEffect(() => {
  let cancelled = false;

    getEvents()
      .then((data) => {
        if (cancelled) {
          return;
        }

        const ownEvents = data.filter(
          (event) =>
            event.ngo === user?.managed_ngo_id,
        );

        setEvents(ownEvents);
        setError("");
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error(err);

        setError(
          "Unable to load events.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.managed_ngo_id]);

    async function refreshEvents() {
      const data = await getEvents();
    
      const ownEvents = data.filter(
        (event) =>
          event.ngo === user?.managed_ngo_id,
      );
    
      setEvents(ownEvents);
    }
  
    async function runAction(
      eventId: number,
      action:
        | "open"
        | "start"
        | "cancel"
        | "complete",
    ) {
      try {
        setWorkingId(eventId);
        setError("");
  
        if (action === "open") {
          await openEvent(eventId);
        }
  
        if (action === "start") {
          await startEvent(eventId);
        }
  
        if (action === "cancel") {
          await cancelEvent(eventId);
        }
  
        if (action === "complete") {
          await completeEvent(eventId);
        }
  
        await refreshEvents();
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to update event.",
        );
      } finally {
        setWorkingId(null);
      }
    }
  
    return (
      <DashboardLayout>
        <div className="space-y-6">
  
          <div className="flex items-center justify-between">
  
            <div>
              <h1 className="text-3xl font-bold">
                Events
              </h1>
  
              <p className="text-gray-600">
                Manage your NGO events.
              </p>
            </div>
  
            <Link
              to="/dashboard/admin/events/create"
              className="rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              Create Event
            </Link>
  
          </div>
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="space-y-4">
  
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
  
                  <div className="flex justify-between">
  
                    <div>
                      <h2 className="text-xl font-semibold">
                        {event.title}
                      </h2>
  
                      <p className="text-gray-500">
                        {event.location}
                      </p>
                    </div>
  
                    <span className="font-medium">
                      {event.status}
                    </span>
  
                  </div>
  
                  <div className="mt-4 flex flex-wrap gap-2">
  
                    {event.status === "DRAFT" && (
                      <>
                        <button
                          disabled={
                            workingId === event.id
                          }
                          onClick={() =>
                            runAction(
                              event.id,
                              "open",
                            )
                          }
                          className="rounded bg-green-600 px-4 py-2 text-white"
                        >
                          Open Event
                        </button>
  
                        <button
                          onClick={() =>
                            runAction(
                              event.id,
                              "cancel",
                            )
                          }
                          className="rounded bg-red-600 px-4 py-2 text-white"
                        >
                          Cancel
                        </button>
                      </>
                    )}
  
                    {event.status === "OPEN" && (
                      <>
                        <button
                          onClick={() =>
                            runAction(
                              event.id,
                              "start",
                            )
                          }
                          className="rounded bg-blue-600 px-4 py-2 text-white"
                        >
                          Start Event
                        </button>
  
                        <button
                          onClick={() =>
                            runAction(
                              event.id,
                              "cancel",
                            )
                          }
                          className="rounded bg-red-600 px-4 py-2 text-white"
                        >
                          Cancel
                        </button>
                      </>
                    )}
  
                    {event.status ===
                      "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          runAction(
                            event.id,
                            "complete",
                          )
                        }
                        className="rounded bg-purple-600 px-4 py-2 text-white"
                      >
                        Complete Event
                      </button>
                    )}
  
                  </div>
  
                </div>
              ))}
  
              {events.length === 0 && (
                <p>
                  No events created yet.
                </p>
              )}
  
            </div>
          )}
  
        </div>
      </DashboardLayout>
    );
  }