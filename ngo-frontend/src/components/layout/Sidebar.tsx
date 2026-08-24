import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/useAuth";

import type {
  UserRole,
} from "../../types/auth";


type IconName =
  | "dashboard"
  | "events"
  | "add"
  | "users"
  | "history"
  | "certificate"
  | "profile"
  | "bell"
  | "ranking"
  | "money"
  | "verified"
  | "team"
  | "attendance"
  | "ngo";


type NavItem = {
  label: string;
  path: string;
  end?: boolean;
  icon: IconName;
};


type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};


const navigationByRole:
Record<
  UserRole,
  NavItem[]
> = {


  /* =========================
     VOLUNTEER
  ========================== */

  VOLUNTEER: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
      icon: "dashboard",
    },

    {
      label: "Browse Events",
      path: "/dashboard/events",
      icon: "events",
    },

    {
      label: "My Registrations",
      path: "/dashboard/registered-events",
      icon: "users",
    },

    {
      label: "History",
      path: "/dashboard/history",
      icon: "history",
    },

    {
      label: "Certificates",
      path: "/dashboard/certificates",
      icon: "certificate",
    },

    {
      label: "Profile",
      path: "/dashboard/profile",
      icon: "profile",
    },

    {
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: "bell",
    },
  ],


  /* =========================
     NGO ADMIN
  ========================== */

  NGO_ADMIN: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
      icon: "dashboard",
    },

    {
      label: "Events",
      path: "/dashboard/admin/events",
      icon: "events",
    },

    {
      label: "Create Event",
      path: "/dashboard/admin/events/create",
      icon: "add",
    },

    {
      label: "Registrations",
      path: "/dashboard/admin/registrations",
      icon: "users",
    },

    {
      label: "Assign Coordinators",
      path: "/dashboard/admin/coordinators",
      icon: "team",
    },

    {
      label: "Volunteer Rankings",
      path: "/dashboard/admin/rankings",
      icon: "ranking",
    },

    {
      label: "Donations",
      path: "/dashboard/admin/donations",
      icon: "money",
    },

    {
      label: "NGO Verification",
      path: "/dashboard/admin/verification",
      icon: "verified",
    },

    {
      label: "NGO Profile",
      path: "/dashboard/admin/profile",
      icon: "ngo",
    },

    {
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: "bell",
    },
  ],


  /* =========================
     COORDINATOR
  ========================== */

  COORDINATOR: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
      icon: "dashboard",
    },

    {
      label: "My Events",
      path: "/dashboard/coordinator/events",
      icon: "events",
    },

    {
      label: "Teams",
      path: "/dashboard/coordinator/teams",
      icon: "team",
    },

    {
      label: "Attendance",
      path: "/dashboard/coordinator/attendance",
      icon: "attendance",
    },

    {
      label: "Profile",
      path: "/dashboard/coordinator/profile",
      icon: "profile",
    },

    {
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: "bell",
    },
  ],


  /* =========================
     DONOR
  ========================== */

  DONOR: [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
      icon: "dashboard",
    },

    {
      label: "Browse NGOs",
      path: "/dashboard/donor/ngos",
      icon: "ngo",
    },

    {
      label: "Make Donation",
      path: "/dashboard/donor/donate",
      icon: "money",
    },

    {
      label: "Donation History",
      path: "/dashboard/donor/history",
      icon: "history",
    },

    {
      label: "Profile",
      path: "/dashboard/donor/profile",
      icon: "profile",
    },

    {
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: "bell",
    },
  ],
};


function Icon({
  name,
}: {
  name: IconName;
}) {
  const common =
    "h-[18px] w-[18px] shrink-0";


  switch (name) {
    case "dashboard":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1.5"
          />

          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1.5"
          />

          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1.5"
          />

          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1.5"
          />
        </svg>
      );


    case "events":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
          />

          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );


    case "add":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />

          <path d="M12 8v8M8 12h8" />
        </svg>
      );


    case "users":
    case "team":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle
            cx="9"
            cy="8"
            r="3"
          />

          <path d="M3.5 19c.8-3.4 2.6-5 5.5-5s4.7 1.6 5.5 5" />

          <path d="M16 6.5a2.5 2.5 0 0 1 0 5M16.5 14c2.2.4 3.5 2 4 4.5" />
        </svg>
      );


    case "history":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 7v5h5" />

          <path d="M5.2 16a8 8 0 1 0-.9-7" />

          <path d="M12 8v5l3 2" />
        </svg>
      );


    case "certificate":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="4"
            y="3"
            width="16"
            height="13"
            rx="2"
          />

          <path d="M9 8h6M8 11h8M10 16v5l2-1.5 2 1.5v-5" />
        </svg>
      );


    case "profile":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
          />

          <path d="M4.5 21c.8-4.2 3.2-6 7.5-6s6.7 1.8 7.5 6" />
        </svg>
      );


    case "bell":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

          <path d="M10 21h4" />
        </svg>
      );


    case "ranking":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 20v-5h4v5M10 20V9h4v11M16 20V4h4v16" />
        </svg>
      );


    case "money":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />

          <circle
            cx="12"
            cy="12"
            r="3"
          />

          <path d="M7 9H6v1M17 15h1v-1" />
        </svg>
      );


    case "verified":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="m12 3 2 2 3-.3.8 2.9 2.7 1.4-1.2 2.8 1.2 2.8-2.7 1.4-.8 2.9-3-.3-2 2-2-2-3 .3-.8-2.9-2.7-1.4 1.2-2.8L3.5 9l2.7-1.4.8-2.9 3 .3 2-2Z" />

          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );


    case "attendance":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z" />

          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );


    case "ngo":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={common}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 21V8l8-5 8 5v13" />

          <path d="M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      );
  }
}


export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const {
    user,
    logout,
  } =
    useAuth();

  const navigate =
    useNavigate();


  function handleLogout() {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }


  const navigationItems =
    user
      ? navigationByRole[
          user.role
        ]
      : [];


  const roleLabel =
    user?.role ===
    "NGO_ADMIN"
      ? "NGO Administrator"
      : user?.role ===
          "COORDINATOR"
        ? "Coordinator"
        : user?.role ===
            "DONOR"
          ? "Donor"
          : "Volunteer";


  const sidebarContent = (
    <div className="flex h-full flex-col">


      <div className="px-3 pb-5 pt-2">

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-200">
          {roleLabel}
        </p>

      </div>


      <nav className="flex-1 space-y-1 overflow-y-auto">

        {navigationItems.map(
          (item) => (

            <NavLink
              key={
                item.path
              }
              to={
                item.path
              }
              end={
                item.end
              }
              onClick={
                onClose
              }
              className={({
                isActive,
              }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-[#263449] text-white shadow-sm ring-1 ring-white/5"
                    : "text-slate-400 hover:bg-[#202d40] hover:text-slate-100",
                ].join(
                  " ",
                )
              }
            >

              {({
                isActive,
              }) => (
                <>

                  <span
                    className={
                      isActive
                        ? "text-blue-300"
                        : "text-slate-500 transition group-hover:text-slate-300"
                    }
                  >
                    <Icon
                      name={
                        item.icon
                      }
                    />
                  </span>


                  <span className="truncate">
                    {
                      item.label
                    }
                  </span>


                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400" />
                  )}

                </>
              )}

            </NavLink>

          ),
        )}

      </nav>


      <div className="mt-5 border-t border-slate-700 pt-4">

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-[18px] w-[18px]"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M10 17l5-5-5-5" />

            <path d="M15 12H3" />

            <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
          </svg>

          Logout

        </button>

      </div>

    </div>
  );


  return (
    <>

      <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[250px] shrink-0 bg-[#172033] p-4 lg:block">

        {sidebarContent}

      </aside>


      {mobileOpen && (

        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={
            onClose
          }
        />

      )}


      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[280px] bg-[#172033] p-4 shadow-2xl transition-transform duration-200 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white">
              N
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                NGO Volunteer
              </p>

              <p className="text-[10px] text-slate-400">
                Coordination Platform
              </p>
            </div>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-[#263449] hover:text-white"
          >
            ×
          </button>

        </div>


        {sidebarContent}

      </aside>

    </>
  );
}