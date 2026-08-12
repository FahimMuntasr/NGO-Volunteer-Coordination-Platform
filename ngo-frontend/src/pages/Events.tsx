import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getEvents } from "../api/events";
import type { Event } from "../types/event";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getEvents();
        setEvents(data);
      } catch {
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <h1 className="mb-6 text-3xl font-bold">Events</h1>
        <p className="text-gray-600">Loading events...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <h1 className="mb-6 text-3xl font-bold">Events</h1>

        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Events</h1>

          <p className="mt-1 text-gray-600">
            Browse available volunteer events.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-gray-600">
              No events are currently available.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    {event.title}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      event.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>NGO:</strong> {event.ngo_name}
                  </p>

                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>

                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(event.start_date).toLocaleString()}
                  </p>

                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(event.end_date).toLocaleString()}
                  </p>

                  <p>
                    <strong>Volunteer capacity:</strong>{" "}
                    {event.volunteer_capacity}
                  </p>
                </div>

                {event.required_skills.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">
                      Required skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {event.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to={`/dashboard/events/${event.id}`}
                  className="mt-6 block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}