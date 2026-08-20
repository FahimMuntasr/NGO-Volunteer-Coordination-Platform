import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/useAuth";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  const navLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-blue-100 font-semibold text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-4">
      <nav className="space-y-2">

        <NavLink
          to="/dashboard"
          className={navLinkClass}
          end
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/events"
          className={navLinkClass}
        >
          Browse Events
        </NavLink>

        <NavLink
          to="/dashboard/registered-events"
          className={navLinkClass}
        >
          My Registrations
        </NavLink>

        <NavLink
          to="/dashboard/history"
          className={navLinkClass}
        >
          History
        </NavLink>

        <NavLink
          to="/dashboard/profile"
          className={navLinkClass}
        >
          Profile
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>

      </nav>
    </aside>
  );
}