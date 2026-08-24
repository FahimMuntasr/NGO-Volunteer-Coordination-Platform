import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getNGODonations,
  updateDonationAllocation,
  type Donation,
} from "../../api/donations";


export default function AdminDonations() {
  const [
    donations,
    setDonations,
  ] =
    useState<Donation[]>([]);

  const [
    allocationInputs,
    setAllocationInputs,
  ] =
    useState<
      Record<
        number,
        string
      >
    >({});

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

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    workingId,
    setWorkingId,
  ] =
    useState<number | null>(
      null,
    );


  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data =
          await getNGODonations();

        setDonations(
          data,
        );

        const inputs:
          Record<
            number,
            string
          > = {};

        data.forEach(
          (donation) => {
            inputs[
              donation.id
            ] =
              donation.allocation_details ??
              "";
          },
        );

        setAllocationInputs(
          inputs,
        );

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load donations.",
        );

      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);


  async function saveAllocation(
    donation: Donation,
  ) {
    try {
      setWorkingId(
        donation.id,
      );

      const updated =
        await updateDonationAllocation(
          donation.id,
          {
            allocation_details:
              allocationInputs[
                donation.id
              ] ?? "",

            acknowledgement_sent:
              donation.acknowledgement_sent,
          },
        );

      setDonations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      );

      setSuccess(
        "Donation updated successfully.",
      );

    } catch {
      setError(
        "Unable to update donation.",
      );

    } finally {
      setWorkingId(null);
    }
  }


  async function toggleAcknowledgement(
    donation: Donation,
  ) {
    try {
      setWorkingId(
        donation.id,
      );

      const updated =
        await updateDonationAllocation(
          donation.id,
          {
            acknowledgement_sent:
              !donation.acknowledgement_sent,
          },
        );

      setDonations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      );

    } catch {
      setError(
        "Unable to update acknowledgement.",
      );

    } finally {
      setWorkingId(null);
    }
  }


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
            Funding
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Donations
          </h1>

          <p className="mt-1 text-slate-500">
            Manage donations and record
            how funds are allocated.
          </p>
        </div>


        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-[#f4f7fa] p-5">
            <p className="text-sm text-slate-500">
              Donations Received
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                donations.length
              }
            </p>
          </div>


          <div className="rounded-2xl bg-emerald-100/60 p-5">
            <p className="text-sm text-emerald-700">
              Total Received
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

        {success && (
          <div className="rounded-2xl bg-emerald-100/60 p-4 text-emerald-700">
            ✓ {success}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading donations...
          </div>

        ) : donations.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-center text-slate-500">
            No donations received yet.
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
                        {donation.donor_name ||
                          donation.donor_username}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Donation #
                        {
                          donation.id
                        }
                        {" · "}
                        {new Date(
                          donation.donated_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>


                    <p className="text-2xl font-bold text-emerald-700">
                      ৳
                      {
                        donation.amount
                      }
                    </p>

                  </div>


                  <div className="mt-5">

                    <label className="text-sm font-semibold text-slate-700">
                      Allocation Details
                    </label>

                    <textarea
                      rows={4}
                      value={
                        allocationInputs[
                          donation.id
                        ] ?? ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setAllocationInputs(
                          (
                            current,
                          ) => ({
                            ...current,

                            [donation.id]:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Describe how the donation was used..."
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
                    />

                  </div>


                  <div className="mt-4 flex flex-wrap gap-3">

                    <button
                      type="button"
                      disabled={
                        workingId ===
                        donation.id
                      }
                      onClick={() =>
                        saveAllocation(
                          donation,
                        )
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                    >
                      Save Allocation
                    </button>


                    <button
                      type="button"
                      disabled={
                        workingId ===
                        donation.id
                      }
                      onClick={() =>
                        toggleAcknowledgement(
                          donation,
                        )
                      }
                      className={`rounded-xl px-4 py-2 font-semibold ${
                        donation.acknowledgement_sent
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#e3eaf1] text-slate-700"
                      }`}
                    >
                      {donation.acknowledgement_sent
                        ? "Acknowledged ✓"
                        : "Mark Acknowledged"}
                    </button>

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