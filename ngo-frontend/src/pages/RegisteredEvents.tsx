import DashboardLayout from "../layouts/DashboardLayout";

type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

type RegisteredEvent = {
  id: number;
  event_title: string;
  ngo_name: string;
  start_date: string;
  end_date: string;
  status: RegistrationStatus;
};

const mockRegisteredEvents: RegisteredEvent[] = [
  {
    id: 1,
    event_title: "Tree Plantation",
    ngo_name: "Helping Hands",
    start_date: "2026-08-20T09:00:00Z",
    end_date: "2026-08-20T15:00:00Z",
    status: "PENDING",
  },
  {
    id: 2,
    event_title: "Community Cleanup",
    ngo_name: "Green Bangladesh",
    start_date: "2026-08-25T09:00:00Z",
    end_date: "2026-08-25T12:00:00Z",
    status: "APPROVED",
  },
  {
    id: 3,
    event_title: "Food Distribution",
    ngo_name: "Helping Hands",
    start_date: "2026-08-30T10:00:00Z",
    end_date: "2026-08-30T14:00:00Z",
    status: "COMPLETED",
  },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClass(status: RegistrationStatus) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function RegisteredEvents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Registered Events
          </h1>

          <p className="mt-1 text-gray-600">
            View the events you have registered for.
          </p>
        </div>

        {mockRegisteredEvents.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No registered events
            </h2>

            <p className="mt-2 text-gray-500">
              You have not registered for any events yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {mockRegisteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {event.event_title}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {event.ngo_name}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                        event.status,
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                  <div>
                    <span className="font-medium text-gray-900">
                      Date:
                    </span>{" "}
                    {formatDate(event.start_date)}
                  </div>

                  <div>
                    <span className="font-medium text-gray-900">
                      Time:
                    </span>{" "}
                    {formatTime(event.start_date)} –{" "}
                    {formatTime(event.end_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}