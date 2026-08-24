import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getMyDonations,
  type Donation,
} from "../../api/donations";

import {
  getDonationAcknowledgement,
} from "../../api/donationAcknowledgement";

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

  // Stores generated acknowledgement
  // for each donation.
  const [
    acknowledgements,
    setAcknowledgements,
  ] =
    useState<
      Record<number, string>
    >({});

  // Tracks which acknowledgement
  // is currently being generated.
  const [
    acknowledgementLoading,
    setAcknowledgementLoading,
  ] =
    useState<number | null>(
      null,
    );

  // Stores which decorators are enabled
  // for each donation.
  const [
    decoratorOptions,
    setDecoratorOptions,
  ] =
    useState<
      Record<
        number,
        {
          donor: boolean;
          ngo: boolean;
          allocation: boolean;
        }
      >
    >({});


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


  /*
   * DECORATOR PATTERN DEMO
   */
  async function handleViewAcknowledgement(
    donationId: number,
  ) {
    try {
      setAcknowledgementLoading(
        donationId,
      );

      setError("");

      const options =
        decoratorOptions[
          donationId
        ] ?? {
          donor: true,
          ngo: true,
          allocation: true,
        };

      const response =
        await getDonationAcknowledgement(
          donationId,
          options,
        );

      setAcknowledgements(
        (current) => ({
          ...current,
          [donationId]:
            response.acknowledgement,
        }),
      );

    } catch {
      setError(
        "Unable to generate donation acknowledgement.",
      );

    } finally {
      setAcknowledgementLoading(
        null,
      );
    }
  }


  function toggleDecorator(
    donationId: number,
    decorator:
      | "donor"
      | "ngo"
      | "allocation",
  ) {
    setDecoratorOptions(
      (current) => {

        const existing =
          current[donationId] ?? {
            donor: true,
            ngo: true,
            allocation: true,
          };

        return {
          ...current,

          [donationId]: {
            ...existing,

            [decorator]:
              !existing[
                decorator
              ],
          },
        };
      },
    );
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


                  {/* =================================
                      DECORATOR OPTIONS
                  ================================= */}

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                      Decorator Options
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose which information should
                      be added to the acknowledgement.
                    </p>


                    <div className="mt-4 flex flex-wrap gap-3">

                      {(
                        [
                          [
                            "donor",
                            "Donor Details",
                          ],
                          [
                            "ngo",
                            "NGO Information",
                          ],
                          [
                            "allocation",
                            "Allocation Details",
                          ],
                        ] as const
                      ).map(
                        ([
                          key,
                          label,
                        ]) => {

                          const options =
                            decoratorOptions[
                              donation.id
                            ] ?? {
                              donor: true,
                              ngo: true,
                              allocation: true,
                            };

                          const enabled =
                            options[
                              key
                            ];

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                toggleDecorator(
                                  donation.id,
                                  key,
                                )
                              }
                              className={`rounded-xl px-4 py-2 font-semibold transition ${
                                enabled
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {enabled
                                ? "✓ "
                                : ""}
                              {label}
                            </button>
                          );
                        },
                      )}

                    </div>

                  </div>


                  <div className="mt-5">

                    <button
                      type="button"

                      disabled={
                        acknowledgementLoading ===
                        donation.id
                      }

                      onClick={() =>
                        handleViewAcknowledgement(
                          donation.id,
                        )
                      }

                      className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {acknowledgementLoading ===
                      donation.id

                        ? "Generating..."

                        : "View Acknowledgement"}

                    </button>

                  </div>


                  {/* =================================
                      GENERATED ACKNOWLEDGEMENT
                  ================================= */}

                  {acknowledgements[
                    donation.id
                  ] && (

                    <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">

                            Decorator Pattern

                          </p>


                          <h3 className="mt-1 text-lg font-bold text-slate-900">

                            Generated Acknowledgement

                          </h3>

                        </div>

                      </div>


                      <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">

                        {
                          acknowledgements[
                            donation.id
                          ]
                        }

                      </pre>

                    </div>

                  )}

                </article>

              ),
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}