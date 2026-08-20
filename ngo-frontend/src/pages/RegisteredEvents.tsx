import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getMyRegistrations,
  type Registration,
  type RegistrationStatus,
} from "../api/registration";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClass(status: RegistrationStatus) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function RegisteredEvents() {
  const [registrations, setRegistrations] = useState<
    Registration[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRegistrations() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRegistrations();

        setRegistrations(data);
      } catch (err) {
        console.error(
          "Failed to load registrations:",
          err,
        );

        setError(
          "Failed to load your registrations. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Registered Events
          </h1>

          <p className="mt-1 text-gray-600">
            View the events you have registered for.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-600">
              Loading your registrations...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          registrations.length === 0 && (
            <div className="rounded-lg border bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No registered events
              </h2>

              <p className="mt-2 text-gray-500">
                You have not registered for any events yet.
              </p>
            </div>
          )}

        {/* Registrations */}

        {!loading &&
          !error &&
          registrations.length > 0 && (
            <div className="grid gap-5">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="rounded-lg border bg-white p-6 shadow-sm"
                >
                  {/* Event information */}

                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {registration.event_title}
                      </h2>

                      <p className="mt-1 text-gray-500">
                        Registration ID:{" "}
                        {registration.id}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                          registration.status,
                        )}`}
                      >
                        {registration.status}
                      </span>
                    </div>
                  </div>

                  {/* Registration information */}

                  <div className="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-2">

                    <div>
                      <span className="font-medium text-gray-900">
                        Registered:
                      </span>{" "}
                      {formatDate(
                        registration.registered_at,
                      )}
                    </div>

                    {registration.approved_at && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Approved:
                        </span>{" "}
                        {formatDate(
                          registration.approved_at,
                        )}
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-gray-900">
                        Attendance:
                      </span>{" "}
                      {registration.attendance_status}
                    </div>

                    <div>
                      <span className="font-medium text-gray-900">
                        Hours earned:
                      </span>{" "}
                      {registration.hours_earned}
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