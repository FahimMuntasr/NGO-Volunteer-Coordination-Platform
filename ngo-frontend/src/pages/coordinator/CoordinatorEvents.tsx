import {
    useEffect,
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { getEvents } from "../../api/events";
  
  import type {
    Event,
  } from "../../types/event";
  
  export default function CoordinatorEvents() {
    const [events, setEvents] =
      useState<Event[]>([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    useEffect(() => {
      let cancelled = false;
  
      getEvents()
        .then((data) => {
          if (!cancelled) {
            setEvents(data);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error(err);
  
            setError(
              "Unable to load assigned events.",
            );
          }
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
  
    return (
      <DashboardLayout>
        <div className="space-y-6">
  
          <div>
            <h1 className="text-3xl font-bold">
              Assigned Events
            </h1>
  
            <p className="mt-1 text-gray-600">
              Events assigned to you.
            </p>
          </div>
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="space-y-4">
  
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <div className="flex justify-between gap-4">
  
                    <div>
                      <h2 className="text-xl font-semibold">
                        {event.title}
                      </h2>
  
                      <p className="mt-1 text-gray-500">
                        {event.ngo_name}
                      </p>
  
                      <p className="mt-1 text-gray-500">
                        {event.location}
                      </p>
                    </div>
  
                    <span className="font-medium">
                      {event.status}
                    </span>
  
                  </div>
  
                  <p className="mt-4">
                    {event.description}
                  </p>
  
                </div>
              ))}
  
              {events.length === 0 && (
                <div className="rounded-xl bg-white p-6 shadow">
                  You have no assigned events.
                </div>
              )}
  
            </div>
          )}
  
        </div>
      </DashboardLayout>
    );
  }