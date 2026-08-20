import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/common/StatCard";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome back, Fahim 👋
          </h1>

          <p className="mt-2 text-blue-100">
            Ready for your next volunteer activity?
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Available Events" value={12} />
          <StatCard title="My Registrations" value={4} />
          <StatCard title="Upcoming Events" value={2} />
          <StatCard title="Certificates" value={3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Events */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">
              Upcoming Events
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">🌱 Tree Plantation Drive</p>
                  <p className="text-sm text-gray-500">Dhaka</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  20 Aug
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">🩸 Blood Donation Camp</p>
                  <p className="text-sm text-gray-500">NSU Campus</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  28 Aug
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">📚 Book Distribution</p>
                  <p className="text-sm text-gray-500">Gazipur</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  5 Sep
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">
              Quick Actions
            </h2>

            <div className="grid gap-3">
              <Link
                to="/dashboard/events"
                className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                Browse Events
              </Link>

              <Link
                to="/dashboard/profile"
                className="rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 hover:bg-gray-200"
              >
                View Profile
              </Link>

              <Link
  to="/dashboard/registered-events"
  className="rounded-lg bg-gray-100 px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-200"
>
  My Registrations
</Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Recent Activity
          </h2>

          <ul className="space-y-3 text-gray-700">
            <li>✅ Registered for Tree Plantation Drive</li>
            <li>🏅 Certificate issued for Blood Donation Camp</li>
            <li>📢 New event added: Community Clean-up</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}