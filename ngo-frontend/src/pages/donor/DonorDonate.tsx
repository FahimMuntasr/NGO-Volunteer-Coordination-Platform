import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  createDonation,
  getVerifiedNGOs,
  type VerifiedNGO,
} from "../../api/donations";


export default function DonorDonate() {
  const [
    searchParams,
  ] =
    useSearchParams();

  const [
    ngos,
    setNGOs,
  ] =
    useState<
      VerifiedNGO[]
    >([]);

  const [
    ngoId,
    setNgoId,
  ] =
    useState("");

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

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


  useEffect(() => {
    async function load() {
      try {
        const data =
          await getVerifiedNGOs();

        setNGOs(data);

        const requested =
          searchParams.get(
            "ngo",
          );

        if (
          requested &&
          data.some(
            (ngo) =>
              String(
                ngo.id,
              ) ===
              requested,
          )
        ) {
          setNgoId(
            requested,
          );
        }

      } catch {
        setError(
          "Unable to load NGOs.",
        );

      } finally {
        setLoading(false);
      }
    }

    load();

  }, [
    searchParams,
  ]);


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const numericAmount =
      Number(amount);

    if (
      !ngoId ||
      !numericAmount ||
      numericAmount <= 0
    ) {
      setError(
        "Select an NGO and enter a valid donation amount.",
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await createDonation({
        ngo:
          Number(
            ngoId,
          ),

        amount:
          numericAmount,
      });

      setAmount("");

      setSuccess(
        "Donation submitted successfully.",
      );

    } catch {
      setError(
        "Unable to submit donation.",
      );

    } finally {
      setSubmitting(false);
    }
  }


  const selectedNGO =
    ngos.find(
      (ngo) =>
        String(
          ngo.id,
        ) ===
        ngoId,
    );


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Support an Organization
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Make a Donation
          </h1>

          <p className="mt-1 text-slate-500">
            Donate directly to a verified
            NGO on the platform.
          </p>
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
            Loading verified NGOs...
          </div>

        ) : (

          <form
            onSubmit={
              handleSubmit
            }
            className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
          >

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Select NGO
              </label>

              <select
                value={
                  ngoId
                }
                onChange={(
                  event,
                ) =>
                  setNgoId(
                    event
                      .target
                      .value,
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
              >
                <option value="">
                  Choose a verified NGO
                </option>

                {ngos.map(
                  (ngo) => (
                    <option
                      key={
                        ngo.id
                      }
                      value={
                        ngo.id
                      }
                    >
                      {
                        ngo.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>


            {selectedNGO && (

              <div className="mt-5 rounded-xl bg-teal-100/50 p-4">

                <p className="font-bold text-teal-800">
                  {
                    selectedNGO.name
                  }
                </p>

                <p className="mt-1 text-sm text-teal-700">
                  {
                    selectedNGO.address
                  }
                </p>

              </div>

            )}


            <div className="mt-5">

              <label className="text-sm font-semibold text-slate-700">
                Donation Amount
              </label>

              <div className="relative mt-2">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  ৳
                </span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={
                    amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setAmount(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-slate-300 bg-[#eef3f7] py-3 pl-9 pr-4"
                />

              </div>

            </div>


            <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white disabled:opacity-50"
            >
              {submitting
                ? "Submitting Donation..."
                : "Donate"}
            </button>

          </form>

        )}

      </div>

    </DashboardLayout>
  );
}