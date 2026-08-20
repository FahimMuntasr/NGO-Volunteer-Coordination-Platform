import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import { getVolunteerHistory } from "../api/volunteers";

import type { VolunteerHistoryItem } from "../types/volunteer";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAttendanceClass(
  status: VolunteerHistoryItem["attendance_status"],
) {
  switch (status) {
    case "PRESENT":
      return "bg-green-100 text-green-700";

    case "ABSENT":
      return "bg-red-100 text-red-700";

    case "EXCUSED":
      return "bg-yellow-100 text-yellow-700";

    case "NOT_MARKED":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function VolunteerHistory() {
  const [history, setHistory] = useState<
    VolunteerHistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getVolunteerHistory();

        setHistory(data);
      } catch (err) {
        console.error(
          "Failed to load volunteer history:",
          err,
        );

        setError(
          "Failed to load your volunteer history. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Volunteer History
          </h1>

          <p className="mt-1 text-gray-600">
            View the events you have completed and your
            volunteer hours.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-lg border bg-white p-6">
            <p className="text-gray-600">
              Loading your volunteer history...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty */}

        {!loading && !error && history.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No completed events
            </h2>

            <p className="mt-2 text-gray-500">
              You have not completed any volunteer events
              yet.
            </p>
          </div>
        )}

        {/* History */}

        {!loading && !error && history.length > 0 && (
          <div className="grid gap-5">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                {/* Event information */}

                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {item.event_title}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {item.ngo_name}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getAttendanceClass(
                        item.attendance_status,
                      )}`}
                    >
                      {item.attendance_status.replace(
                        "_",
                        " ",
                      )}
                    </span>
                  </div>
                </div>

                {/* Event date/time */}

                <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      Date
                    </p>

                    <p className="mt-1 text-gray-600">
                      {formatDate(item.event_start_date)}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">
                      Time
                    </p>

                    <p className="mt-1 text-gray-600">
                      {formatTime(item.event_start_date)}{" "}
                      –{" "}
                      {formatTime(item.event_end_date)}
                    </p>
                  </div>
                </div>

                {/* Volunteer result */}

                <div className="mt-5 border-t pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Event Status
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {item.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Hours Earned
                      </p>

                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {item.hours_earned}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}