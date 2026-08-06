import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/common/StatCard";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="mb-8 text-3xl font-bold">
          Dashboard
        </h1>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Available Events"
            value={12}
          />

          <StatCard
            title="My Registrations"
            value={4}
          />

          <StatCard
            title="Upcoming Events"
            value={2}
          />

          <StatCard
            title="Certificates"
            value={3}
          />
        </div>

        <div className="mt-10 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Recent Events
          </h2>

          <ul className="space-y-3">
            <li>🌱 Tree Plantation Drive</li>
            <li>🩸 Blood Donation Camp</li>
            <li>📚 Book Distribution</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}