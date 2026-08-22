import {
    useEffect,
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { getEvents } from "../../api/events";
  
  import {
    assignCoordinator,
    getCoordinators,
    type CoordinatorOption,
  } from "../../api/admin";
  
  import type {
    Event,
  } from "../../types/event";
  
  export default function AssignCoordinator() {
    const [events, setEvents] =
      useState<Event[]>([]);
  
    const [coordinators, setCoordinators] =
      useState<CoordinatorOption[]>([]);
  
    const [selections, setSelections] =
      useState<Record<number, number>>({});
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [success, setSuccess] =
      useState("");
  
    const [workingId, setWorkingId] =
      useState<number | null>(null);
  
    useEffect(() => {
      let cancelled = false;
  
      Promise.all([
        getEvents(),
        getCoordinators(),
      ])
        .then(
          ([
            eventsData,
            coordinatorsData,
          ]) => {
            if (cancelled) {
              return;
            }
  
            setEvents(eventsData);
            setCoordinators(
              coordinatorsData,
            );
          },
        )
        .catch((err) => {
          if (cancelled) {
            return;
          }
  
          console.error(err);
  
          setError(
            "Unable to load coordinator data.",
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
    }, []);
  
    async function handleAssign(
      eventId: number,
    ) {
      const coordinatorId =
        selections[eventId];
  
      if (!coordinatorId) {
        setError(
          "Please select a coordinator.",
        );
        return;
      }
  
      try {
        setWorkingId(eventId);
        setError("");
        setSuccess("");
  
        await assignCoordinator(
          eventId,
          coordinatorId,
        );
  
        const updatedEvents =
          await getEvents();
  
        setEvents(updatedEvents);
  
        setSuccess(
          "Coordinator assigned successfully.",
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to assign coordinator.",
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
              Assign Coordinators
            </h1>
  
            <p className="mt-1 text-gray-600">
              Assign coordinators to your
              NGO events.
            </p>
          </div>
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}
  
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
  
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <h2 className="text-xl font-semibold">
                    {event.title}
                  </h2>
  
                  <p className="mt-1 text-gray-500">
                    Current coordinator:{" "}
                    {event.coordinator_username ??
                      "None"}
                  </p>
  
                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
  
                    <select
                      value={
                        selections[
                          event.id
                        ] ?? ""
                      }
                      onChange={(e) =>
                        setSelections(
                          (current) => ({
                            ...current,
                            [event.id]:
                              Number(
                                e.target.value,
                              ),
                          }),
                        )
                      }
                      className="flex-1 rounded-lg border p-3"
                    >
                      <option value="">
                        Select coordinator
                      </option>
  
                      {coordinators.map(
                        (coordinator) => (
                          <option
                            key={
                              coordinator.id
                            }
                            value={
                              coordinator.id
                            }
                          >
                            {
                              coordinator.username
                            }
                          </option>
                        ),
                      )}
  
                    </select>
  
                    <button
                      type="button"
                      disabled={
                        workingId === event.id
                      }
                      onClick={() =>
                        handleAssign(
                          event.id,
                        )
                      }
                      className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                    >
                      Assign
                    </button>
  
                  </div>
                </div>
              ))}
  
            </div>
          )}
  
        </div>
      </DashboardLayout>
    );
  }