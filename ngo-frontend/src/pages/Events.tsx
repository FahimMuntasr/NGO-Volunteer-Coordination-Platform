import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getEvents,
} from "../api/events";

import type {
  Event,
} from "../types/event";

import DashboardLayout from "../layouts/DashboardLayout";


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}


function statusClass(
  status: Event["status"],
) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-slate-200 text-slate-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "DRAFT":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-200 text-slate-700";
  }
}


export default function Events() {
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
    search,
    setSearch,
  ] =
    useState("");


  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEvents();

        setEvents(
          data,
        );

      } catch (err) {
        console.error(
          "Failed to load events:",
          err,
        );

        setError(
          "Failed to load events.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);


  const filteredEvents =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return events;
        }

        return events.filter(
          (event) =>
            event.title
              .toLowerCase()
              .includes(
                query,
              ) ||
            event.ngo_name
              .toLowerCase()
              .includes(
                query,
              ) ||
            event.location
              .toLowerCase()
              .includes(
                query,
              ) ||
            event.description
              .toLowerCase()
              .includes(
                query,
              ),
        );
      },
      [
        events,
        search,
      ],
    );


  const openCount =
    events.filter(
      (event) =>
        event.status ===
        "OPEN",
    ).length;


  return (
    <DashboardLayout>

      <div className="space-y-6">


        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-400/10" />

          <div className="absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-teal-400/10" />


          <div className="relative">

            <div className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Volunteer Opportunities
            </div>


            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Browse Events
            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore available volunteer
              opportunities and find an
              event that matches your
              interests and skills.
            </p>


            <div className="mt-6 flex flex-wrap gap-3">

              <div className="rounded-xl border border-slate-500/40 bg-slate-700/30 px-4 py-2">

                <p className="text-xs text-slate-400">
                  Available events
                </p>

                <p className="text-lg font-bold">
                  {
                    events.length
                  }
                </p>

              </div>


              <div className="rounded-xl border border-slate-500/40 bg-slate-700/30 px-4 py-2">

                <p className="text-xs text-slate-400">
                  Open now
                </p>

                <p className="text-lg font-bold text-teal-300">
                  {
                    openCount
                  }
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* Search */}

        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

          <div className="relative">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-3.5-3.5" />
            </svg>


            <input
              type="text"
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search by event, NGO, location, or description..."
              className="w-full rounded-xl border border-slate-300 bg-[#eef3f7] py-3 pl-12 pr-4 text-slate-800"
            />

          </div>

        </section>


        {/* Error */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
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

        ) : filteredEvents.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3eaf1] text-slate-500">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                />

                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>

            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              No events found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or
              check back when new
              opportunities are added.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredEvents.map(
              (event) => (

                <article
                  key={
                    event.id
                  }
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f4f7fa] shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                >


                  {/* Accent */}

                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-teal-400" />


                  <div className="flex flex-1 flex-col p-6">


                    {/* NGO / Status */}

                    <div className="flex items-start justify-between gap-3">

                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {
                          event.ngo_name
                        }
                      </p>


                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                          event.status,
                        )}`}
                      >
                        {
                          event.status
                        }
                      </span>

                    </div>


                    <h2 className="mt-3 text-xl font-bold text-slate-900 transition group-hover:text-blue-700">
                      {
                        event.title
                      }
                    </h2>


                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {
                        event.description
                      }
                    </p>


                    {/* Info */}

                    <div className="mt-5 space-y-3 text-sm">

                      <div className="flex items-center gap-3 text-slate-600">

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3eaf1] text-slate-500">
                          ◎
                        </span>

                        <span>
                          {
                            event.location
                          }
                        </span>

                      </div>


                      <div className="flex items-center gap-3 text-slate-600">

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3eaf1] text-slate-500">
                          ◷
                        </span>

                        <span>
                          {formatDate(
                            event.start_date,
                          )}
                        </span>

                      </div>


                      <div className="flex items-center gap-3 text-slate-600">

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3eaf1] text-slate-500">
                          ♙
                        </span>

                        <span>
                          {
                            event.volunteer_capacity
                          }{" "}
                          volunteer capacity
                        </span>

                      </div>

                    </div>


                    {/* Skills */}

                    {event.required_skills.length >
                      0 && (

                      <div className="mt-5 border-t border-slate-300/50 pt-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Skills
                        </p>


                        <div className="mt-2 flex flex-wrap gap-2">

                          {event.required_skills
                            .slice(
                              0,
                              4,
                            )
                            .map(
                              (
                                skill,
                              ) => (

                                <span
                                  key={
                                    skill
                                  }
                                  className="rounded-full bg-blue-100/70 px-2.5 py-1 text-xs font-medium text-blue-700"
                                >
                                  {
                                    skill
                                  }
                                </span>

                              ),
                            )}

                        </div>

                      </div>

                    )}


                    <div className="mt-auto pt-6">

                      <Link
                        to={`/dashboard/events/${event.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#263449] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                      >
                        View Event Details
                        <span>→</span>
                      </Link>

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