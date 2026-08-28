import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getEvents,
} from "../../api/events";

import {
  assignCoordinator,
  getCoordinators,
  type CoordinatorOption,
} from "../../api/admin";

import type {
  Event,
} from "../../types/event";


export default function AssignCoordinator() {
  const [
    events,
    setEvents,
  ] =
    useState<Event[]>([]);

  const [
    coordinators,
    setCoordinators,
  ] =
    useState<
      CoordinatorOption[]
    >([]);

  const [
    selections,
    setSelections,
  ] =
    useState<
      Record<
        number,
        number
      >
    >({});

  const [
    reasons,
    setReasons,
  ] =
    useState<
      Record<
        number,
        string
      >
    >({});

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
    success,
    setSuccess,
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
    Promise.all([
      getEvents(),
      getCoordinators(),
    ])
      .then(
        ([
          eventData,
          coordinatorData,
        ]) => {
          setEvents(
            eventData,
          );

          setCoordinators(
            coordinatorData,
          );
        },
      )
      .catch((err) => {
        console.error(err);

        setError(
          "Unable to load coordinator data.",
        );
      })
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  async function handleAssign(
    eventId: number,
  ) {
    const coordinatorId =
      selections[
        eventId
      ];

    if (
      !coordinatorId
    ) {
      setError(
        "Please select a coordinator.",
      );

      return;
    }

    const currentEvent = events.find(
      (item) => item.id === eventId,
    );

    const isReassignment =
      !!currentEvent?.coordinator &&
      currentEvent.coordinator !== coordinatorId;

    const reason = (
      reasons[eventId] ?? ""
    ).trim();

    if (isReassignment && !reason) {
      setError(
        "Please explain why this event is being reassigned - the previous coordinator will see this reason.",
      );

      return;
    }

    try {
      setWorkingId(
        eventId,
      );

      setError("");
      setSuccess("");

      await assignCoordinator(
        eventId,
        coordinatorId,
        isReassignment ? reason : undefined,
      );

      setEvents(
        await getEvents(),
      );

      setReasons(
        (current) => ({
          ...current,
          [eventId]: "",
        }),
      );

      setSuccess(
        isReassignment
          ? "Coordinator changed successfully."
          : "Coordinator assigned successfully.",
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to assign coordinator.",
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

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Event Staffing
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Assign Coordinators
          </h1>

          <p className="mt-1 text-slate-500">
            Assign registered coordinators
            to manage your NGO's events.
          </p>
        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {success && (
          <div className="rounded-2xl bg-emerald-100/60 p-4 text-emerald-700">
            ✓ {success}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading...
          </div>

        ) : events.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-center text-slate-500">
            No events available.
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

                  <h2 className="text-xl font-bold text-slate-900">
                    {
                      event.title
                    }
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Current coordinator:{" "}

                    <span className="font-semibold text-slate-700">
                      {event.coordinator_username ??
                        "None"}
                    </span>
                  </p>


                  <div className="mt-5 flex flex-col gap-3 md:flex-row">

                    <select
                      value={
                        selections[
                          event.id
                        ] ?? ""
                      }
                      onChange={(
                        e,
                      ) =>
                        setSelections(
                          (
                            current,
                          ) => ({
                            ...current,

                            [event.id]:
                              Number(
                                e
                                  .target
                                  .value,
                              ),
                          }),
                        )
                      }
                      className="flex-1 rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
                    >
                      <option value="">
                        Select Coordinator
                      </option>

                      {coordinators.map(
                        (
                          coordinator,
                        ) => (
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
                        workingId ===
                        event.id
                      }
                      onClick={() =>
                        handleAssign(
                          event.id,
                        )
                      }
                      className={`rounded-xl px-6 py-3 font-semibold text-white disabled:opacity-50 ${
                        event.coordinator
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {workingId ===
                      event.id
                        ? "Working..."
                        : event.coordinator
                        ? "Change"
                        : "Assign"}
                    </button>

                  </div>


                  {event.coordinator &&
                    selections[event.id] &&
                    selections[event.id] !==
                      event.coordinator && (

                      <div className="mt-3">

                        <label className="text-sm font-semibold text-slate-700">
                          Reason for reassignment
                        </label>

                        <p className="mt-1 text-xs text-slate-500">
                          Shown to {event.coordinator_username}{" "}
                          when they're removed from this event -
                          e.g. workload balancing, or the new
                          coordinator being closer to the venue.
                        </p>

                        <textarea
                          rows={3}
                          value={
                            reasons[event.id] ?? ""
                          }
                          onChange={(e) =>
                            setReasons(
                              (current) => ({
                                ...current,
                                [event.id]:
                                  e.target.value,
                              }),
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
                        />

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