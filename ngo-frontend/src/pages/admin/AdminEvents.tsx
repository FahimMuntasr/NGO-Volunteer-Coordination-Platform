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

import {
  downloadAttendanceReport,
} from "../../api/certificates";

import type {
  Event,
} from "../../types/event";


function statusClass(
  status: Event["status"],
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


function formatStatus(
  status: Event["status"],
) {
  return status.replace(
    "_",
    " ",
  );
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


  const [
    reportWorkingId,
    setReportWorkingId,
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
        if (
          cancelled
        ) {
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
        console.error(
          err,
        );

        if (
          !cancelled
        ) {
          setError(
            "Unable to load events.",
          );
        }
      })
      .finally(() => {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      });


    return () => {
      cancelled =
        true;
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
      setSuccess("");


      if (
        action ===
        "open"
      ) {
        await openEvent(
          eventId,
        );

        setSuccess(
          "Event opened successfully.",
        );
      }


      if (
        action ===
        "start"
      ) {
        await startEvent(
          eventId,
        );

        setSuccess(
          "Event started successfully.",
        );
      }


      if (
        action ===
        "cancel"
      ) {
        await cancelEvent(
          eventId,
        );

        setSuccess(
          "Event cancelled successfully.",
        );
      }


      if (
        action ===
        "complete"
      ) {
        await completeEvent(
          eventId,
        );

        setSuccess(
          "Event completed successfully.",
        );
      }


      await refreshEvents();

    } catch (err) {
      console.error(
        err,
      );

      setError(
        "Unable to update event.",
      );

    } finally {
      setWorkingId(
        null,
      );
    }
  }


  async function handleAttendanceReport(
    eventId: number,
  ) {
    try {
      setReportWorkingId(
        eventId,
      );

      setError("");
      setSuccess("");


      const reportBlob =
        await downloadAttendanceReport(
          eventId,
        );


      const downloadUrl =
        URL.createObjectURL(
          reportBlob,
        );


      const link =
        document.createElement(
          "a",
        );


      link.href =
        downloadUrl;

      link.download =
        `attendance_report_${eventId}.pdf`;


      document.body.appendChild(
        link,
      );

      link.click();

      document.body.removeChild(
        link,
      );


      URL.revokeObjectURL(
        downloadUrl,
      );


      setSuccess(
        "Attendance report downloaded successfully.",
      );

    } catch (err) {
      console.error(
        "Failed to download attendance report:",
        err,
      );

      setError(
        "Unable to download attendance report.",
      );

    } finally {
      setReportWorkingId(
        null,
      );
    }
  }


  return (
    <DashboardLayout>

      <div className="space-y-6">


        {/* Header */}

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
              lifecycle and attendance
              reports.
            </p>

          </div>


          <Link
            to="/dashboard/admin/events/create"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Event
          </Link>

        </div>


        {/* Error */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
          </div>

        )}


        {/* Success */}

        {success && (

          <div className="rounded-2xl border border-emerald-200 bg-emerald-100/60 p-4 text-emerald-700">
            ✓ {success}
          </div>

        )}


        {/* Loading */}

        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              Loading events...

            </div>

          </div>

        ) : events.length ===
          0 ? (

          /* Empty */

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-10 text-center">

            <h2 className="text-lg font-bold text-slate-800">
              No events yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your first volunteer
              event to get started.
            </p>


            <Link
              to="/dashboard/admin/events/create"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Create Event
            </Link>

          </div>

        ) : (

          /* Events */

          <div className="space-y-4">

            {events.map(
              (event) => (

                <article
                  key={
                    event.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
                >


                  {/* Event Header */}

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          event.title
                        }
                      </h2>


                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">

                        <span>
                          {
                            event.location
                          }
                        </span>


                        <span>
                          Capacity:{" "}
                          {
                            event.capacity_mode === "UNLIMITED"
                              ? "Unlimited"
                              : event.volunteer_capacity
                          }
                        </span>

                      </div>

                    </div>


                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        event.status,
                      )}`}
                    >
                      {formatStatus(
                        event.status,
                      )}
                    </span>

                  </div>


                  {/* Actions */}

                  <div className="mt-5 flex flex-wrap gap-3">


                    {/* View */}

                    <Link
                      to={`/dashboard/events/${event.id}`}
                      className="rounded-xl border border-slate-300 bg-[#eaf0f5] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      View Details
                    </Link>


                    {/* Draft actions */}

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
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {workingId ===
                          event.id
                            ? "Updating..."
                            : "Open Event"}
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
                          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                      </>

                    )}


                    {/* Open actions */}

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
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {workingId ===
                          event.id
                            ? "Updating..."
                            : "Start Event"}
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
                          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                      </>

                    )}


                    {/* In Progress */}

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
                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                      >
                        {workingId ===
                        event.id
                          ? "Completing..."
                          : "Complete Event"}
                      </button>

                    )}


                    {/* Attendance Report */}

                    {(
                      event.status ===
                        "IN_PROGRESS" ||
                      event.status ===
                        "COMPLETED"
                    ) && (

                      <button
                        type="button"
                        disabled={
                          reportWorkingId ===
                          event.id
                        }
                        onClick={() =>
                          handleAttendanceReport(
                            event.id,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-100/60 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white disabled:opacity-50"
                      >

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-4 w-4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3v12" />

                          <path d="m7 10 5 5 5-5" />

                          <path d="M5 21h14" />
                        </svg>


                        {reportWorkingId ===
                        event.id
                          ? "Generating Report..."
                          : "Download Attendance Report"}

                      </button>

                    )}

                  </div>


                  {/* Factory Method note */}

                  {event.status ===
                    "COMPLETED" && (

                    <div className="mt-5 rounded-xl border border-teal-200/60 bg-teal-50/60 px-4 py-3">

                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                        Event Completed
                      </p>

                      <p className="mt-1 text-sm text-teal-800">
                        The finalized attendance
                        report is available for
                        download.
                      </p>

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