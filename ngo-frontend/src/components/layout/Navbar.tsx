import { useAuth } from "../../context/useAuth";


type NavbarProps = {
  onMenuClick: () => void;
};


function formatRole(
  role: string,
) {
  switch (role) {
    case "NGO_ADMIN":
      return "NGO Administrator";

    case "COORDINATOR":
      return "Coordinator";

    case "DONOR":
      return "Donor";

    case "VOLUNTEER":
      return "Volunteer";

    default:
      return role;
  }
}


export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  const { user } = useAuth();


  const displayName = user
    ? (
        `${user.first_name} ${user.last_name}`
          .trim() ||
        user.username
      )
    : "User";


  const initials = user
    ? (
        `${user.first_name?.[0] ?? ""}${
          user.last_name?.[0] ?? ""
        }`
          .toUpperCase() ||
        user.username
          .slice(0, 2)
          .toUpperCase()
      )
    : "U";


  return (
    <header className="sticky top-0 z-30 border-b border-slate-300/70 bg-[#e3eaf1]/95 backdrop-blur">

      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6">


        {/* Left Side */}

        <div className="flex items-center gap-3">

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-[#eef3f7] text-slate-700 shadow-sm transition hover:bg-[#dce6ee] lg:hidden"
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>

          </button>


          {/* Branding */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-lg font-bold text-white shadow-md">
              N
            </div>


            <div>

              <p className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                NGO Volunteer Coordination
              </p>

              <p className="hidden text-xs text-slate-500 sm:block">
                Volunteer Management Platform
              </p>

            </div>

          </div>

        </div>


        {/* User Information */}

        {user && (

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold text-slate-800">
                {displayName}
              </p>

              <p className="mt-0.5 text-xs font-semibold text-blue-600">
                {formatRole(user.role)}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-sm font-bold text-white shadow-md ring-4 ring-slate-300/40">

              {initials}

            </div>

          </div>

        )}

      </div>

    </header>
  );
}