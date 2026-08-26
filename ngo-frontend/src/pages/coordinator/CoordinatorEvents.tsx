import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getEvents,
} from "../../api/events";

import type {
  Event,
} from "../../types/event";


function statusClass(
  status:
    Event["status"],
) {
  return status ===
    "IN_PROGRESS"
    ? "bg-blue-100 text-blue-700"
    : status ===
        "OPEN"
      ? "bg-emerald-100 text-emerald-700"
      : status ===
          "COMPLETED"
        ? "bg-teal-100 text-teal-700"
        : "bg-slate-200 text-slate-700";
}


export default function CoordinatorEvents() {
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


  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => {
        console.error(err);

        setError(
          "Unable to load assigned events.",
        );
      })
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Coordinator
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Assigned Events
          </h1>

          <p className="mt-1 text-slate-500">
            Events currently assigned to
            you for coordination.
          </p>
        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading events...
          </div>

        ) : events.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-10 text-center text-slate-500">
            You have no assigned events.
          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2">

            {events.map(
              (event) => (

                <article
                  key={
                    event.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex justify-between gap-3">

                    <div>
                      <p className="text-xs font-semibold uppercase text-blue-600">
                        {
                          event.ngo_name
                        }
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-slate-900">
                        {
                          event.title
                        }
                      </h2>
                    </div>


                    <span
                      className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        event.status,
                      )}`}
                    >
                      {
                        event.status
                      }
                    </span>

                  </div>


                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {
                      event.description
                    }
                  </p>


                  <p className="mt-4 text-sm font-medium text-slate-600">
                    {
                      event.location
                    }
                  </p>


                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="mt-5 inline-flex font-semibold text-blue-600"
                  >
                    View Event →
                  </Link>

                </article>

              ),
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}