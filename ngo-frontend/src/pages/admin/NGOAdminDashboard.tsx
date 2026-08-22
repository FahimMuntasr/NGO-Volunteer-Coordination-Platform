import {
    useEffect,
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { useAuth } from "../../context/useAuth";
  
  import {
    getNGODashboard,
    type NGODashboardData,
  } from "../../api/admin";
  
  export default function NGOAdminDashboard() {
    const { user } = useAuth();
  
    const [data, setData] =
      useState<NGODashboardData | null>(null);
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      async function loadDashboard() {
        if (!user?.managed_ngo_id) {
          setError(
            "This account is not connected to an NGO.",
          );
  
          setLoading(false);
          return;
        }
  
        try {
          const dashboardData =
            await getNGODashboard(
              user.managed_ngo_id,
            );
  
          setData(dashboardData);
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load NGO dashboard.",
          );
        } finally {
          setLoading(false);
        }
      }
  
      loadDashboard();
    }, [user]);
  
    return (
      <DashboardLayout>
        <div className="space-y-6">
  
          <div>
            <h1 className="text-3xl font-bold">
              {user?.managed_ngo_name ??
                "NGO Dashboard"}
            </h1>
  
            <p className="mt-1 text-gray-600">
              NGO Administrator Dashboard
            </p>
          </div>
  
          {loading && (
            <p>Loading dashboard...</p>
          )}
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {data && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
  
                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-gray-500">
                    Events
                  </p>
  
                  <p className="mt-2 text-3xl font-bold">
                    {data.events.total}
                  </p>
                </div>
  
                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-gray-500">
                    Registrations
                  </p>
  
                  <p className="mt-2 text-3xl font-bold">
                    {data.registrations.total}
                  </p>
                </div>
  
                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-gray-500">
                    Donations
                  </p>
  
                  <p className="mt-2 text-3xl font-bold">
                    {data.donations.count}
                  </p>
                </div>
  
              </div>
  
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold">
                  Event Status
                </h2>
  
                <div className="mt-4 grid gap-3 md:grid-cols-5">
  
                  <p>
                    Draft: {data.events.draft}
                  </p>
  
                  <p>
                    Open: {data.events.open}
                  </p>
  
                  <p>
                    Active: {data.events.in_progress}
                  </p>
  
                  <p>
                    Completed: {data.events.completed}
                  </p>
  
                  <p>
                    Cancelled: {data.events.cancelled}
                  </p>
  
                </div>
              </div>
            </>
          )}
  
        </div>
      </DashboardLayout>
    );
  }