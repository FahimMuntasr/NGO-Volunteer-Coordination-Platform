import DashboardLayout from "../layouts/DashboardLayout";

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-8 text-3xl font-bold">
          My Profile
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Username
            </h2>
            <p className="text-lg text-gray-800">fahim</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Full Name
            </h2>
            <p className="text-lg text-gray-800">
              Fahim Muntasir
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Email
            </h2>
            <p className="text-lg text-gray-800">
              fahim@example.com
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Role
            </h2>
            <p className="text-lg text-gray-800">
              Volunteer
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Phone
            </h2>
            <p className="text-lg text-gray-800">
              +880 1XXXXXXXXX
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            Edit Profile
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}