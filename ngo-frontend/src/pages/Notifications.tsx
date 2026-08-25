import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getNotifications,
  markNotificationRead,
  type Notification,
} from "../api/notifications";


const NOTIFICATION_LINKS: Record<string, string> = {
  CERTIFICATE_ISSUED: "/dashboard/certificates",
  COORDINATOR_ASSIGNED: "/dashboard/coordinator/events",
};


function formatDate(
  date?: string,
) {
  if (!date) {
    return "";
  }

  return new Date(
    date,
  ).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}


export default function Notifications() {
  const [
    notifications,
    setNotifications,
  ] =
    useState<Notification[]>([]);

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
    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getNotifications();

        setNotifications(
          data,
        );

      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err,
        );

        setError(
          "Failed to load notifications.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);


  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (
            notification,
          ) =>
            !notification.is_read,
        ).length,
      [
        notifications,
      ],
    );


  const readCount =
    notifications.length -
    unreadCount;


  async function handleRead(
    notification: Notification,
  ) {
    if (
      notification.is_read
    ) {
      return;
    }

    try {
      const updated =
        await markNotificationRead(
          notification.id,
        );

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      );

    } catch (err) {
      console.error(
        err,
      );

      setError(
        "Failed to mark notification as read.",
      );
    }
  }


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-5xl space-y-6">


        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-blue-400/10" />

          <div className="absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-teal-400/10" />


          <div className="relative">

            <div className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Activity Center
            </div>


            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Stay informed about events,
              registrations, teams,
              donations, and other activity
              related to your account.
            </p>

          </div>

        </section>


        {/* Stats */}

        <div className="grid gap-4 sm:grid-cols-3">


          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

            <p className="text-sm font-semibold text-slate-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                notifications.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-blue-200/70 bg-blue-100/60 p-5">

            <p className="text-sm font-semibold text-blue-600">
              Unread
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {
                unreadCount
              }
            </p>

          </div>


          <div className="rounded-2xl border border-teal-200/70 bg-teal-100/60 p-5">

            <p className="text-sm font-semibold text-teal-700">
              Read
            </p>

            <p className="mt-2 text-3xl font-bold text-teal-800">
              {
                readCount
              }
            </p>

          </div>

        </div>


        {/* Error */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-sm text-red-700">
            {error}
          </div>

        )}


        {/* Loading */}

        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              Loading notifications...

            </div>

          </div>

        ) : notifications.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3eaf1]">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7 text-slate-500"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

                <path d="M10 21h4" />
              </svg>

            </div>


            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No notifications yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New activity will appear
              here when something happens.
            </p>

          </div>

        ) : (

          <section className="overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f4f7fa] shadow-[0_4px_20px_rgba(15,23,42,0.04)]">


            {/* Section Header */}

            <div className="border-b border-slate-300/50 px-6 py-5">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Recent Activity
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                All Notifications
              </h2>

            </div>


            <div className="divide-y divide-slate-300/50">

              {notifications.map(
                (
                  notification,
                ) => (

                  <div
                    key={
                      notification.id
                    }
                    className={`p-5 transition sm:p-6 ${
                      notification
                        .is_read
                        ? "bg-[#f4f7fa]"
                        : "bg-blue-50/70"
                    }`}
                  >

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">


                      {/* Left */}

                      <div className="flex min-w-0 gap-4">


                        {/* Icon */}

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            notification
                              .is_read
                              ? "bg-[#e3eaf1] text-slate-500"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >

                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

                            <path d="M10 21h4" />
                          </svg>

                        </div>


                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-bold text-slate-800">
                              {
                                notification.title
                              }
                            </h3>


                            {!notification
                              .is_read && (

                              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                New
                              </span>

                            )}

                          </div>


                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {
                              notification.message
                            }
                          </p>


                          {notification.created_at && (

                            <p className="mt-2 text-xs font-medium text-slate-400">
                              {formatDate(
                                notification.created_at,
                              )}
                            </p>

                          )}


                          {NOTIFICATION_LINKS[
                            notification.notification_type
                          ] && (

                            <Link
                              to={
                                NOTIFICATION_LINKS[
                                  notification.notification_type
                                ]
                              }
                              className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
                            >
                              {notification.notification_type ===
                              "CERTIFICATE_ISSUED"
                                ? "View certificate"
                                : "View event"}
                            </Link>

                          )}

                        </div>

                      </div>


                      {/* Button */}

                      {!notification
                        .is_read && (

                        <button
                          type="button"
                          onClick={() =>
                            handleRead(
                              notification,
                            )
                          }
                          className="shrink-0 rounded-xl border border-blue-300 bg-blue-100/60 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                        >
                          Mark as Read
                        </button>

                      )}

                    </div>

                  </div>

                ),
              )}

            </div>

          </section>

        )}

      </div>

    </DashboardLayout>
  );
}