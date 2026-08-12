import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getEvent, registerForEvent } from "../api/events";
import type { Event } from "../types/event";
import DashboardLayout from "../layouts/DashboardLayout";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await getEvent(Number(id));

        setEvent(data);
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  async function handleRegister() {
    if (!id) {
      return;
    }

    try {
      setRegistering(true);
      setRegistrationSuccess("");
      setRegistrationError("");

      await registerForEvent(Number(id));

      setRegistrationSuccess(
        "You have successfully registered for this event.",
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response;

        setRegistrationError(
          response?.data?.detail ||
            "Failed to register for this event.",
        );
      } else {
        setRegistrationError(
          "Failed to register for this event.",
        );
      }
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <h1 className="mb-6 text-3xl font-bold">
          Event Details
        </h1>

        <p className="text-gray-600">Loading event...</p>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <h1 className="mb-6 text-3xl font-bold">
          Event Details
        </h1>

        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Event not found or could not be loaded.
        </div>

        <Link
          to="/dashboard/events"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to Events
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Link
          to="/dashboard/events"
          className="mb-6 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to Events
        </Link>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                {event.ngo_name}
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                event.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {event.status}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="mb-2 text-lg font-semibold">
              About this event
            </h2>

            <p className="leading-7 text-gray-600">
              {event.description}
            </p>
          </div>

          {/* Event information */}
          <div className="grid gap-6 border-t pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Location
              </p>

              <p className="mt-1 text-gray-900">
                {event.location}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Volunteer Capacity
              </p>

              <p className="mt-1 text-gray-900">
                {event.volunteer_capacity}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Start Date
              </p>

              <p className="mt-1 text-gray-900">
                {new Date(
                  event.start_date,
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                End Date
              </p>

              <p className="mt-1 text-gray-900">
                {new Date(
                  event.end_date,
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Registration Deadline
              </p>

              <p className="mt-1 text-gray-900">
                {new Date(
                  event.registration_deadline,
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Event Status
              </p>

              <p className="mt-1 text-gray-900">
                {event.status}
              </p>
            </div>
          </div>

          {/* Required skills */}
          {event.required_skills.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="mb-3 text-lg font-semibold">
                Required Skills
              </h2>

              <div className="flex flex-wrap gap-2">
                {event.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Registration */}
          <div className="mt-8 border-t pt-6">
            {registrationSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
                {registrationSuccess}
              </div>
            )}

            {registrationError && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
                {registrationError}
              </div>
            )}

            <button
              type="button"
              onClick={handleRegister}
              disabled={
                event.status !== "OPEN" || registering
              }
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {registering
                ? "Registering..."
                : event.status === "OPEN"
                  ? "Register for Event"
                  : "Registration Unavailable"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}