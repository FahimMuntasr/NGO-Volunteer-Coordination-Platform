import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../types/auth";

type NavItem = {
  label: string;
  path: string;
  end?: boolean;
};

const navigationByRole: Record<UserRole, NavItem[]> = {
  VOLUNTEER: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
    },
    {
      label: "Browse Events",
      path: "/dashboard/events",
    },
    {
      label: "My Registrations",
      path: "/dashboard/registered-events",
    },
    {
      label: "History",
      path: "/dashboard/history",
    },
    {
      label: "Certificates",
      path: "/dashboard/certificates",
    },
    {
      label: "Profile",
      path: "/dashboard/profile",
    },
    {
      label: "Notifications",
      path: "/dashboard/notifications",
    },
  ],

  NGO_ADMIN: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
    },
    {
      label: "Events",
      path: "/dashboard/admin/events",
    },
    {
      label: "Create Event",
      path: "/dashboard/admin/events/create",
    },
    {
      label: "Registrations",
      path: "/dashboard/admin/registrations",
    },
    {
      label: "Volunteer Rankings",
      path: "/dashboard/admin/rankings",
    },
    {
      label: "Donations",
      path: "/dashboard/admin/donations",
    },
    {
      label: "NGO Verification",
      path: "/dashboard/admin/verification",
    },
    {
      label: "Notifications",
      path: "/dashboard/notifications",
    },
  ],

  COORDINATOR: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
    },
    {
      label: "My Events",
      path: "/dashboard/coordinator/events",
    },
    {
      label: "Teams",
      path: "/dashboard/coordinator/teams",
    },
    {
      label: "Attendance",
      path: "/dashboard/coordinator/attendance",
    },
    {
      label: "Notifications",
      path: "/dashboard/notifications",
    },
  ],

  DONOR: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
    },
    {
      label: "Make Donation",
      path: "/dashboard/donor/donate",
    },
    {
      label: "Donation History",
      path: "/dashboard/donor/history",
    },
    {
      label: "NGOs",
      path: "/dashboard/donor/ngos",
    },
    {
      label: "Notifications",
      path: "/dashboard/notifications",
    },
  ],
};

export default function Sidebar() {
  const {
    user,
    logout,
  } = useAuth();

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

  const navigationItems = user
    ? navigationByRole[user.role]
    : [];

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-4">
      <nav className="space-y-2">

        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navLinkClass}
            end={item.end}
          >
            {item.label}
          </NavLink>
        ))}

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