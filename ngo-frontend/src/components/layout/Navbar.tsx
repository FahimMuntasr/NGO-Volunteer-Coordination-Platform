import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "User";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">
        NGO Volunteer Platform
      </h1>

      <div className="text-right">
        <p className="font-medium text-gray-800">
          {displayName}
        </p>

        {user && (
          <p className="text-xs text-gray-500">
            {user.role}
          </p>
        )}
      </div>
    </header>
  );
}