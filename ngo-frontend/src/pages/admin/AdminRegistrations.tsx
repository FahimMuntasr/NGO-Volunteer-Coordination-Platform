import {
    useEffect,
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { useAuth } from "../../context/useAuth";
  
  import { getEvents } from "../../api/events";
  
  import {
    getEventRegistrations,
    approveRegistration,
    rejectRegistration,
  } from "../../api/eventManagement";
  
  import type {
    Event,
    EventRegistration,
  } from "../../types/event";
  
  export default function AdminRegistrations() {
    const { user } = useAuth();
  
    const [events, setEvents] =
      useState<Event[]>([]);
  
    const [selectedEventId, setSelectedEventId] =
      useState<number | null>(null);
  
    const [registrations, setRegistrations] =
      useState<EventRegistration[]>([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [workingId, setWorkingId] =
      useState<number | null>(null);
  
    useEffect(() => {
      async function loadEvents() {
        try {
          setLoading(true);
          setError("");
  
          const data = await getEvents();
  
          const ownEvents = data.filter(
            (event) =>
              event.ngo === user?.managed_ngo_id,
          );
  
          setEvents(ownEvents);
  
          if (ownEvents.length > 0) {
            setSelectedEventId(
              ownEvents[0].id,
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
      async function loadRegistrations() {
        if (!selectedEventId) {
          setRegistrations([]);
          return;
        }
  
        try {
          setLoading(true);
          setError("");
  
          const data =
            await getEventRegistrations(
              selectedEventId,
            );
  
          setRegistrations(data);
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load registrations.",
          );
        } finally {
          setLoading(false);
        }
      }
  
      loadRegistrations();
    }, [selectedEventId]);
  
    async function handleApprove(
      registrationId: number,
    ) {
      try {
        setWorkingId(registrationId);
        setError("");
  
        const updated =
          await approveRegistration(
            registrationId,
          );
  
        setRegistrations((current) =>
          current.map((registration) =>
            registration.id === updated.id
              ? updated
              : registration,
          ),
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to approve registration.",
        );
      } finally {
        setWorkingId(null);
      }
    }
  
    async function handleReject(
      registrationId: number,
    ) {
      try {
        setWorkingId(registrationId);
        setError("");
  
        const updated =
          await rejectRegistration(
            registrationId,
          );
  
        setRegistrations((current) =>
          current.map((registration) =>
            registration.id === updated.id
              ? updated
              : registration,
          ),
        );
      } catch (err) {
        console.error(err);
  
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
            <h1 className="text-3xl font-bold">
              Registrations
            </h1>
  
            <p className="mt-1 text-gray-600">
              Approve or reject volunteers
              who registered for your events.
            </p>
          </div>
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {events.length > 0 && (
            <div className="rounded-xl bg-white p-5 shadow">
              <label className="font-medium">
                Select Event
              </label>
  
              <select
                value={
                  selectedEventId ?? ""
                }
                onChange={(event) =>
                  setSelectedEventId(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="mt-2 w-full rounded-lg border p-3"
              >
                {events.map((event) => (
                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {event.title}
                    {" — "}
                    {event.status}
                  </option>
                ))}
              </select>
            </div>
          )}
  
          {!loading &&
            events.length === 0 && (
              <div className="rounded-xl bg-white p-6 shadow">
                No events found.
              </div>
            )}
  
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
  
              {registrations.map(
                (registration) => (
                  <div
                    key={registration.id}
                    className="rounded-xl bg-white p-6 shadow"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
  
                      <div>
                        <h2 className="text-lg font-semibold">
                          {
                            registration.volunteer_username
                          }
                        </h2>
  
                        <p className="mt-1 text-sm text-gray-500">
                          Registration #
                          {registration.id}
                        </p>
  
                        <p className="mt-1 text-sm text-gray-500">
                          Registered:{" "}
                          {new Date(
                            registration.registered_at,
                          ).toLocaleString()}
                        </p>
                      </div>
  
                      <div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                          {
                            registration.status
                          }
                        </span>
                      </div>
  
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
                          className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
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
                          className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
  
                      </div>
                    )}
  
                  </div>
                ),
              )}
  
              {selectedEventId &&
                registrations.length === 0 && (
                  <div className="rounded-xl bg-white p-6 shadow">
                    No registrations for this
                    event yet.
                  </div>
                )}
  
            </div>
          )}
  
        </div>
      </DashboardLayout>
    );
  }