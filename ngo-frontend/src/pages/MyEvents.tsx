import DashboardLayout from "../layouts/DashboardLayout";

export default function MyEvents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Registered Events</h1>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-semibold">
                Tree Plantation Drive
              </h2>
              <p className="text-gray-500">20 August 2026 • Dhaka</p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Registered
            </span>
          </div>

          <p className="mt-4 text-gray-600">
            You have successfully registered for this event.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-semibold">
                Blood Donation Camp
              </h2>
              <p className="text-gray-500">28 August 2026 • NSU Campus</p>
            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
              Upcoming
            </span>
          </div>

          <p className="mt-4 text-gray-600">
            This event is scheduled for next week.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}