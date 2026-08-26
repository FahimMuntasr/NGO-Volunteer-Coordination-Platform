import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getVolunteerHistory,
} from "../api/volunteers";

import type {
  VolunteerHistoryItem,
} from "../types/volunteer";


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}


function formatTime(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}


function attendanceClass(
  status:
    VolunteerHistoryItem["attendance_status"],
) {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-100 text-emerald-700";

    case "ABSENT":
      return "bg-red-100 text-red-700";

    case "EXCUSED":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-200 text-slate-700";
  }
}


export default function VolunteerHistory() {
  const [
    history,
    setHistory,
  ] =
    useState<
      VolunteerHistoryItem[]
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


  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getVolunteerHistory();

        setHistory(data);

      } catch (err) {
        console.error(err);

        setError(
          "Failed to load your volunteer history.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);


  const totalHours =
    history.reduce(
      (
        total,
        item,
      ) =>
        total +
        Number(
          item.hours_earned,
        ),
      0,
    );


  return (
    <DashboardLayout>

      <div className="space-y-6">


        <section className="rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200">
            Contribution History
          </div>

          <h1 className="mt-3 text-3xl font-bold">
            Volunteer History
          </h1>

          <p className="mt-2 text-slate-300">
            Review completed events and
            the hours you have contributed.
          </p>

        </section>


        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-5">
            <p className="text-sm font-semibold text-slate-500">
              Completed Events
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                history.length
              }
            </p>
          </div>


          <div className="rounded-2xl bg-teal-100/60 p-5">
            <p className="text-sm font-semibold text-teal-700">
              Hours Earned
            </p>

            <p className="mt-2 text-3xl font-bold text-teal-800">
              {totalHours}
            </p>
          </div>

        </div>


        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading your history...
          </div>

        ) : history.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-10 text-center">

            <h2 className="text-xl font-bold text-slate-800">
              No completed events
            </h2>

            <p className="mt-2 text-slate-500">
              Completed volunteer events
              will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {history.map(
              (item) => (

                <article
                  key={
                    item.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          item.event_title
                        }
                      </h2>

                      <p className="mt-1 text-slate-500">
                        {
                          item.ngo_name
                        }
                      </p>

                    </div>


                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-bold ${attendanceClass(
                        item.attendance_status,
                      )}`}
                    >
                      {item.attendance_status.replace(
                        "_",
                        " ",
                      )}
                    </span>

                  </div>


                  <div className="mt-5 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl bg-[#eaf0f5] p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Start
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {formatDate(
                          item.event_start_date,
                        )}
                        {" · "}
                        {formatTime(
                          item.event_start_date,
                        )}
                      </p>
                    </div>


                    <div className="rounded-xl bg-[#eaf0f5] p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        End
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {formatDate(
                          item.event_end_date,
                        )}
                        {" · "}
                        {formatTime(
                          item.event_end_date,
                        )}
                      </p>
                    </div>


                    <div className="rounded-xl bg-blue-100/60 p-4">
                      <p className="text-xs font-semibold uppercase text-blue-600">
                        Hours Earned
                      </p>

                      <p className="mt-2 text-2xl font-bold text-blue-700">
                        {
                          item.hours_earned
                        }
                      </p>
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