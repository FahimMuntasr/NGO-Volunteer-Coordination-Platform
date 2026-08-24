import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getEvents,
} from "../../api/events";

import {
  getEventRegistrations,
} from "../../api/eventManagement";

import {
  markAttendance,
} from "../../api/coordinator";

import type {
  AttendanceStatus,
  Event,
  EventRegistration,
} from "../../types/event";


export default function CoordinatorAttendance() {
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
    getEvents()
      .then((data) => {
        setEvents(data);

        if (
          data.length >
          0
        ) {
          setSelectedEventId(
            data[0].id,
          );
        }
      })
      .catch(() =>
        setError(
          "Unable to load assigned events.",
        ),
      )
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  useEffect(() => {
    if (
      !selectedEventId
    ) {
      return;
    }

    getEventRegistrations(
      selectedEventId,
    )
      .then(
        setRegistrations,
      )
      .catch(() =>
        setError(
          "Unable to load registrations.",
        ),
      );

  }, [
    selectedEventId,
  ]);


  async function handleAttendance(
    registrationId: number,
    status:
      AttendanceStatus,
  ) {
    try {
      setWorkingId(
        registrationId,
      );

      setError("");
      setSuccess("");

      const updated =
        await markAttendance(
          registrationId,
          status,
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

      setSuccess(
        "Attendance updated.",
      );

    } catch {
      setError(
        "Unable to mark attendance.",
      );

    } finally {
      setWorkingId(null);
    }
  }


  const approved =
    registrations.filter(
      (item) =>
        item.status ===
        "APPROVED",
    );


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Event Operations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Attendance
          </h1>

          <p className="mt-1 text-slate-500">
            Record attendance for approved
            volunteers.
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


        {!loading && (
          <section className="rounded-2xl bg-[#f4f7fa] p-5">

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

        ) : approved.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-center text-slate-500">
            No approved volunteers for this event.
          </div>

        ) : (

          <div className="space-y-4">

            {approved.map(
              (registration) => (

                <article
                  key={
                    registration.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>

                      <h2 className="text-lg font-bold text-slate-900">
                        {
                          registration.volunteer_username
                        }
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Current attendance:{" "}

                        <span className="font-semibold">
                          {
                            registration.attendance_status
                          }
                        </span>
                      </p>

                    </div>


                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        disabled={
                          workingId ===
                          registration.id
                        }
                        onClick={() =>
                          handleAttendance(
                            registration.id,
                            "PRESENT",
                          )
                        }
                        className="rounded-xl bg-emerald-100 px-4 py-2 font-semibold text-emerald-700"
                      >
                        Present
                      </button>


                      <button
                        type="button"
                        disabled={
                          workingId ===
                          registration.id
                        }
                        onClick={() =>
                          handleAttendance(
                            registration.id,
                            "ABSENT",
                          )
                        }
                        className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-700"
                      >
                        Absent
                      </button>


                      <button
                        type="button"
                        disabled={
                          workingId ===
                          registration.id
                        }
                        onClick={() =>
                          handleAttendance(
                            registration.id,
                            "EXCUSED",
                          )
                        }
                        className="rounded-xl bg-amber-100 px-4 py-2 font-semibold text-amber-700"
                      >
                        Excused
                      </button>

                    </div>

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