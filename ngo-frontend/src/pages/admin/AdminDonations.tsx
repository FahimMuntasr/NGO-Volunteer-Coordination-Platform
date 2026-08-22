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
    const [donations, setDonations] =
      useState<Donation[]>([]);
  
    const [allocationInputs, setAllocationInputs] =
      useState<Record<number, string>>({});
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [success, setSuccess] =
      useState("");
  
    const [workingId, setWorkingId] =
      useState<number | null>(null);
  
    useEffect(() => {
      async function loadDonations() {
        try {
          setLoading(true);
          setError("");
  
          const data =
            await getNGODonations();
  
          setDonations(data);
  
          const inputs: Record<
            number,
            string
          > = {};
  
          data.forEach((donation) => {
            inputs[donation.id] =
              donation.allocation_details ?? "";
          });
  
          setAllocationInputs(inputs);
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load donations.",
          );
        } finally {
          setLoading(false);
        }
      }
  
      loadDonations();
    }, []);
  
    async function saveAllocation(
      donation: Donation,
    ) {
      try {
        setWorkingId(donation.id);
        setError("");
        setSuccess("");
  
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
  
        setDonations((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );
  
        setSuccess(
          "Donation updated successfully.",
        );
      } catch (err) {
        console.error(err);
  
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
        setWorkingId(donation.id);
        setError("");
        setSuccess("");
  
        const updated =
          await updateDonationAllocation(
            donation.id,
            {
              acknowledgement_sent:
                !donation.acknowledgement_sent,
            },
          );
  
        setDonations((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to update acknowledgement.",
        );
      } finally {
        setWorkingId(null);
      }
    }
  
    return (
      <DashboardLayout>
        <div className="space-y-6">
  
          <div>
            <h1 className="text-3xl font-bold">
              Donations
            </h1>
  
            <p className="mt-1 text-gray-600">
              View donations received by your
              NGO and record how funds were used.
            </p>
          </div>
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}
  
          {loading ? (
            <p>Loading donations...</p>
          ) : (
            <div className="space-y-4">
  
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
  
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
  
                    <div>
                      <h2 className="text-xl font-semibold">
                        {donation.donor_name ||
                          donation.donor_username}
                      </h2>
  
                      <p className="mt-1 text-gray-500">
                        Donation #{donation.id}
                      </p>
  
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(
                          donation.donated_at,
                        ).toLocaleString()}
                      </p>
                    </div>
  
                    <div className="text-2xl font-bold text-green-700">
                      ৳{donation.amount}
                    </div>
  
                  </div>
  
                  <div className="mt-5">
  
                    <label className="font-medium">
                      Allocation Details
                    </label>
  
                    <textarea
                      value={
                        allocationInputs[
                          donation.id
                        ] ?? ""
                      }
                      onChange={(event) =>
                        setAllocationInputs(
                          (current) => ({
                            ...current,
                            [donation.id]:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="Describe how this donation was used..."
                      className="mt-2 w-full rounded-lg border p-3"
                    />
  
                  </div>
  
                  <div className="mt-4 flex flex-wrap items-center gap-3">
  
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
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
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
                      className="rounded-lg bg-gray-200 px-4 py-2"
                    >
                      {donation.acknowledgement_sent
                        ? "Acknowledged ✓"
                        : "Mark Acknowledged"}
                    </button>
  
                  </div>
  
                </div>
              ))}
  
              {donations.length === 0 && (
                <div className="rounded-xl bg-white p-6 shadow">
                  No donations received yet.
                </div>
              )}
  
            </div>
          )}
  
        </div>
      </DashboardLayout>
    );
  }