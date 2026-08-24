import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";

import {
  useAuth,
} from "../../context/useAuth";

import {
  getMyDonations,
  getVerifiedNGOs,
  type Donation,
  type VerifiedNGO,
} from "../../api/donations";


function formatTaka(
  amount: number,
) {
  return `৳${amount.toLocaleString(
    "en-BD",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}


export default function DonorDashboard() {
  const {
    user,
  } =
    useAuth();


  const [
    donations,
    setDonations,
  ] =
    useState<Donation[]>([]);

  const [
    ngos,
    setNGOs,
  ] =
    useState<VerifiedNGO[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          donationsData,
          ngoData,
        ] =
          await Promise.all([
            getMyDonations(),
            getVerifiedNGOs(),
          ]);

        setDonations(
          donationsData,
        );

        setNGOs(
          ngoData,
        );

      } catch (err) {
        console.error(
          err,
        );

        setError(
          "Unable to load donor dashboard.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, []);


  const totalDonated =
    donations.reduce(
      (
        total,
        donation,
      ) =>
        total +
        Number(
          donation.amount,
        ),
      0,
    );


  const acknowledged =
    donations.filter(
      (donation) =>
        donation.acknowledgement_sent,
    ).length;


  const recentDonations =
    donations.slice(
      0,
      5,
    );


  return (
    <DashboardLayout>

      <div className="space-y-7">


        {/* Welcome */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-9">

          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-teal-400/10" />

          <div className="absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-blue-400/10" />


          <div className="relative">

            <div className="mb-3 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200">
              Donor Workspace
            </div>


            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

              Welcome
              {user?.first_name
                ? `, ${user.first_name}`
                : ""}
              .

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Support verified NGOs,
              review your contribution
              history, and see how your
              donations are being used.
            </p>


            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/dashboard/donor/ngos"
                className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Browse NGOs
              </Link>


              <Link
                to="/dashboard/donor/donate"
                className="rounded-xl border border-slate-500/50 bg-slate-700/40 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Make Donation
              </Link>

            </div>

          </div>

        </section>


        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
          </div>

        )}


        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              Loading donor dashboard...

            </div>

          </div>

        ) : (

          <>


            {/* Stats */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Donations Made"
                value={
                  donations.length
                }
              />

              <StatCard
                title="Total Donated"
                value={
                  formatTaka(
                    totalDonated,
                  )
                }
              />

              <StatCard
                title="Verified NGOs"
                value={
                  ngos.length
                }
              />

              <StatCard
                title="Acknowledged"
                value={
                  acknowledged
                }
              />

            </div>


            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">


              {/* Recent Donations */}

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Contributions
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Recent Donations
                    </h2>

                  </div>


                  <Link
                    to="/dashboard/donor/history"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View all →
                  </Link>

                </div>


                {recentDonations.length ===
                0 ? (

                  <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-[#eaf0f5] p-8 text-center">

                    <p className="font-medium text-slate-600">
                      No donations yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your contribution
                      history will appear
                      here.
                    </p>

                  </div>

                ) : (

                  <div className="mt-5 divide-y divide-slate-300/50">

                    {recentDonations.map(
                      (donation) => (

                        <div
                          key={
                            donation.id
                          }
                          className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                        >

                          <div>

                            <p className="font-semibold text-slate-800">
                              {
                                donation.ngo_name
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {formatDate(
                                donation.donated_at,
                              )}
                            </p>

                          </div>


                          <div className="sm:text-right">

                            <p className="font-bold text-slate-800">
                              {formatTaka(
                                Number(
                                  donation.amount,
                                ),
                              )}
                            </p>


                            <span
                              className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                donation.acknowledgement_sent
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {donation.acknowledgement_sent
                                ? "Acknowledged"
                                : "Pending acknowledgement"}
                            </span>

                          </div>

                        </div>

                      ),
                    )}

                  </div>

                )}

              </section>


              {/* Quick Actions */}

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                  Shortcuts
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Quick Actions
                </h2>


                <div className="mt-5 space-y-3">

                  <Link
                    to="/dashboard/donor/ngos"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Browse Verified NGOs
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/donor/donate"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Make a Donation
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/donor/history"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Donation History
                    <span>→</span>
                  </Link>


                  <Link
                    to="/dashboard/donor/profile"
                    className="flex items-center justify-between rounded-xl border border-slate-300/60 bg-[#eaf0f5] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Donor Profile
                    <span>→</span>
                  </Link>

                </div>

              </section>

            </div>


            {/* NGOs */}

            <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Organizations
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Verified NGOs
                  </h2>

                </div>


                <Link
                  to="/dashboard/donor/ngos"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Explore →
                </Link>

              </div>


              {ngos.length === 0 ? (

                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-[#eaf0f5] p-7 text-center text-slate-500">
                  No verified NGOs are
                  currently available.
                </div>

              ) : (

                <div className="mt-5 grid gap-4 md:grid-cols-3">

                  {ngos
                    .slice(
                      0,
                      3,
                    )
                    .map(
                      (ngo) => (

                        <div
                          key={
                            ngo.id
                          }
                          className="rounded-xl border border-slate-300/60 bg-[#eaf0f5] p-5"
                        >

                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-700">
                            {
                              ngo.name
                                .charAt(
                                  0,
                                )
                                .toUpperCase()
                            }
                          </div>


                          <p className="font-bold text-slate-800">
                            {
                              ngo.name
                            }
                          </p>


                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                            {
                              ngo.description ||
                              "Verified nonprofit organization."
                            }
                          </p>


                          <Link
                            to={`/dashboard/donor/donate?ngo=${ngo.id}`}
                            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Donate →
                          </Link>

                        </div>

                      ),
                    )}

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </DashboardLayout>
  );
}