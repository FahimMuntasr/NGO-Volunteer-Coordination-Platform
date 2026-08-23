import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getNotifications,
  markNotificationRead,
  type Notification,
} from "../api/notifications";

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const data = await getNotifications();

        setNotifications(data);
      } catch {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.is_read,
      ).length,
    [notifications],
  );

  async function handleRead(
    notification: Notification,
  ) {
    if (notification.is_read) {
      return;
    }

    try {
      const updated =
        await markNotificationRead(
          notification.id,
        );

      setNotifications((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );
    } catch {
      setError(
        "Failed to mark notification as read.",
      );
    }
  }

  function formatDate(date?: string) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-gray-600">
            Stay updated on registrations,
            events, teams, and donations.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Notifications
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-5 shadow">
            <p className="text-sm text-blue-700">
              Unread
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>

        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <div className="text-4xl">
              🔔
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              No notifications yet
            </h2>

            <p className="mt-2 text-gray-500">
              New activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-5 shadow-sm transition ${
                    notification.is_read
                      ? "border-gray-200 bg-white"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div className="flex gap-4">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          notification.is_read
                            ? "bg-gray-100"
                            : "bg-blue-100"
                        }`}
                      >
                        🔔
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="font-semibold text-gray-900">
                            {notification.title}
                          </h2>

                          {!notification.is_read && (
                            <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                              New
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-gray-600">
                          {notification.message}
                        </p>

                        {notification.created_at && (
                          <p className="mt-2 text-xs text-gray-400">
                            {formatDate(
                              notification.created_at,
                            )}
                          </p>
                        )}
                      </div>

                    </div>

                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRead(notification)
                        }
                        className="shrink-0 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
                      >
                        Mark as Read
                      </button>
                    )}

                  </div>
                </div>
              ),
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}