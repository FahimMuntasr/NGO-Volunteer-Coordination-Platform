import DashboardLayout from "../layouts/DashboardLayout";

export default function EventDetails() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold">
          Tree Plantation Drive
        </h1>

        <p className="mt-3 text-gray-500">
          📅 20 August 2026
        </p>

        <p className="text-gray-500">
          📍 Dhaka
        </p>

        <div className="mt-6">
          <h2 className="mb-2 text-xl font-semibold">
            Description
          </h2>

          <p className="text-gray-700">
            Join us in planting trees around the city to
            create a greener and healthier environment.
          </p>
        </div>

        <button className="mt-8 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
          Register for Event
        </button>
      </div>
    </DashboardLayout>
  );
}