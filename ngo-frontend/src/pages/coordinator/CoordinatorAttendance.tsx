import {
    useEffect,
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { getEvents } from "../../api/events";
  
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
  
    const [success, setSuccess] =
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
  
          setEvents(data);
  
          if (data.length > 0) {
            setSelectedEventId(
              data[0].id,
            );
          }
        })
        .catch((err) => {
          if (cancelled) {
            return;
          }
  
          console.error(err);
  
          setError(
            "Unable to load assigned events.",
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
  
    useEffect(() => {
      if (!selectedEventId) {
        return;
      }
  
      let cancelled = false;
  
      getEventRegistrations(
        selectedEventId,
      )
        .then((data) => {
          if (cancelled) {
            return;
          }
  
          setRegistrations(data);
          setError("");
        })
        .catch((err) => {
          if (cancelled) {
            return;
          }
  
          console.error(err);
  
          setError(
            "Unable to load registrations.",
          );
        });
  
      return () => {
        cancelled = true;
      };
    }, [selectedEventId]);
  
    async function handleAttendance(
      registrationId: number,
      attendanceStatus: AttendanceStatus,
    ) {
      try {
        setWorkingId(registrationId);
        setError("");
        setSuccess("");
  
        const updated =
          await markAttendance(
            registrationId,
            attendanceStatus,
          );
  
        setRegistrations((current) =>
          current.map((registration) =>
            registration.id === updated.id
              ? updated
              : registration,
          ),
        );
  
        setSuccess(
          "Attendance updated.",
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to mark attendance.",
        );
      } finally {
        setWorkingId(null);
      }
    }
  
    const approvedRegistrations =
      registrations.filter(
        (registration) =>
          registration.status ===
          "APPROVED",
      );
  
    return (
      <DashboardLayout>
        <div className="space-y-6">
  
          <div>
            <h1 className="text-3xl font-bold">
              Attendance
            </h1>
  
            <p className="mt-1 text-gray-600">
              Mark attendance for approved
              volunteers.
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
            <>
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
  
              <div className="space-y-4">
  
                {approvedRegistrations.map(
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
  
                          <p className="mt-1 text-gray-500">
                            Current:{" "}
                            {
                              registration.attendance_status
                            }
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
                            className="rounded-lg bg-green-600 px-4 py-2 text-white"
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
                            className="rounded-lg bg-red-600 px-4 py-2 text-white"
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
                            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
                          >
                            Excused
                          </button>
  
                        </div>
  
                      </div>
                    </div>
                  ),
                )}
  
                {approvedRegistrations.length ===
                  0 && (
                  <div className="rounded-xl bg-white p-6 shadow">
                    No approved volunteers for
                    this event.
                  </div>
                )}
  
              </div>
            </>
          )}
  
        </div>
      </DashboardLayout>
    );
  }