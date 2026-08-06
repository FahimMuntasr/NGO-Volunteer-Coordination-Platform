import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 p-6">
      <nav className="flex flex-col gap-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `rounded-md px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/events"
          className={({ isActive }) =>
            `rounded-md px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          Events
        </NavLink>

        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `rounded-md px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          Profile
        </NavLink>

        <NavLink
          to="/login"
          className="mt-6 rounded-md px-3 py-2 text-red-600 transition hover:bg-red-100"
        >
          Logout
        </NavLink>
      </nav>
    </aside>
  );
}