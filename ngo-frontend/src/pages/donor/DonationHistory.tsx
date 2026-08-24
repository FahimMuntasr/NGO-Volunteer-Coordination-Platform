import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getMyDonations,
  type Donation,
} from "../../api/donations";


export default function DonationHistory() {
  const [
    donations,
    setDonations,
  ] =
    useState<Donation[]>([]);

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
    getMyDonations()
      .then(
        setDonations,
      )
      .catch(() =>
        setError(
          "Unable to load donation history.",
        ),
      )
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  const total =
    donations.reduce(
      (
        sum,
        donation,
      ) =>
        sum +
        Number(
          donation.amount,
        ),
      0,
    );


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Contributions
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Donation History
          </h1>

          <p className="mt-1 text-slate-500">
            Review your donations and
            how recipient NGOs have
            allocated them.
          </p>
        </div>


        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-[#f4f7fa] p-5">
            <p className="text-sm text-slate-500">
              Donations Made
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                donations.length
              }
            </p>
          </div>


          <div className="rounded-2xl bg-emerald-100/60 p-5">
            <p className="text-sm text-emerald-700">
              Total Donated
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-800">
              ৳
              {total.toLocaleString()}
            </p>
          </div>

        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading history...
          </div>

        ) : donations.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-10 text-center text-slate-500">
            You haven't made any donations yet.
          </div>

        ) : (

          <div className="space-y-4">

            {donations.map(
              (donation) => (

                <article
                  key={
                    donation.id
                  }
                  className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex flex-col justify-between gap-4 sm:flex-row">

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          donation.ngo_name
                        }
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(
                          donation.donated_at,
                        ).toLocaleString()}
                      </p>
                    </div>


                    <p className="text-2xl font-bold text-emerald-700">
                      ৳
                      {
                        donation.amount
                      }
                    </p>

                  </div>


                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl bg-[#eaf0f5] p-4">

                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Allocation Details
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {donation.allocation_details ||
                          "The NGO has not provided allocation details yet."}
                      </p>

                    </div>


                    <div
                      className={`rounded-xl p-4 ${
                        donation.acknowledgement_sent
                          ? "bg-emerald-100/60"
                          : "bg-amber-100/60"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Acknowledgement
                      </p>

                      <p className="mt-2 font-bold">
                        {donation.acknowledgement_sent
                          ? "Acknowledged ✓"
                          : "Pending"}
                      </p>
                    </div>

                  </div>

                </article>

              ),
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}