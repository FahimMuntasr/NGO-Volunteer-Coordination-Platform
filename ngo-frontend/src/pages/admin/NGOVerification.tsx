import {
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  useAuth,
} from "../../context/useAuth";

import {
  verifyNGO,
  type VerificationResult,
} from "../../api/admin";


export default function NGOVerification() {
  const {
    user,
  } =
    useAuth();

  const [
    registrationNumber,
    setRegistrationNumber,
  ] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState<VerificationResult | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !user?.managed_ngo_id
    ) {
      setError(
        "This account is not connected to an NGO.",
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const data =
        await verifyNGO(
          user.managed_ngo_id,
          registrationNumber,
        );

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to verify NGO.",
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Organization Identity
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            NGO Verification
          </h1>

          <p className="mt-2 text-slate-500">
            Verify{" "}
            <span className="font-semibold">
              {
                user?.managed_ngo_name
              }
            </span>{" "}
            using its official registration
            number.
          </p>
        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
        >

          <label className="text-sm font-semibold text-slate-700">
            NGO Registration Number
          </label>

          <input
            value={
              registrationNumber
            }
            onChange={(
              event,
            ) =>
              setRegistrationNumber(
                event
                  .target
                  .value,
              )
            }
            required
            className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3"
          />


          <button
            type="submit"
            disabled={
              submitting
            }
            className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting
              ? "Verifying..."
              : "Verify NGO"}
          </button>

        </form>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {result && (

          <section
            className={`rounded-2xl border p-6 ${
              result.verified
                ? "border-emerald-200 bg-emerald-100/60"
                : "border-red-200 bg-red-100/50"
            }`}
          >

            <div className="flex items-center gap-4">

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${
                  result.verified
                    ? "bg-emerald-200 text-emerald-700"
                    : "bg-red-200 text-red-700"
                }`}
              >
                {result.verified
                  ? "✓"
                  : "×"}
              </div>


              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {result.verified
                    ? "NGO Verified"
                    : "Verification Failed"}
                </h2>

                <p className="mt-1 text-slate-600">
                  {
                    result.message
                  }
                </p>
              </div>

            </div>


            <p className="mt-5 text-sm text-slate-600">
              Verification Status:{" "}

              <span className="font-bold">
                {
                  result.verification_status
                }
              </span>
            </p>

          </section>

        )}

      </div>

    </DashboardLayout>
  );
}