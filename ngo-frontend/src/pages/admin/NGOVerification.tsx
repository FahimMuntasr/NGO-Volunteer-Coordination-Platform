import {
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { useAuth } from "../../context/useAuth";
  
  import {
    verifyNGO,
    type VerificationResult,
  } from "../../api/admin";
  
  export default function NGOVerification() {
    const { user } = useAuth();
  
    const [
      registrationNumber,
      setRegistrationNumber,
    ] = useState("");
  
    const [result, setResult] =
      useState<VerificationResult | null>(null);
  
    const [error, setError] = useState("");
    const [submitting, setSubmitting] =
      useState(false);
  
    async function handleSubmit(
      event: React.FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      if (!user?.managed_ngo_id) {
        setError(
          "This account is not connected to an NGO.",
        );
  
        return;
      }
  
      try {
        setSubmitting(true);
        setError("");
        setResult(null);
  
        const verification =
          await verifyNGO(
            user.managed_ngo_id,
            registrationNumber,
          );
  
        setResult(verification);
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
        <div className="max-w-2xl">
  
          <h1 className="text-3xl font-bold">
            NGO Verification
          </h1>
  
          <p className="mt-2 text-gray-600">
            Verify {user?.managed_ngo_name}
            {" "}using its registration number.
          </p>
  
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl bg-white p-6 shadow"
          >
  
            <label className="block font-medium">
              NGO Registration Number
            </label>
  
            <input
              value={registrationNumber}
              onChange={(event) =>
                setRegistrationNumber(
                  event.target.value,
                )
              }
              required
              className="mt-2 w-full rounded-lg border p-3"
            />
  
            <button
              disabled={submitting}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              {submitting
                ? "Verifying..."
                : "Verify NGO"}
            </button>
  
          </form>
  
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {result && (
            <div className="mt-4 rounded-lg bg-white p-6 shadow">
  
              <h2 className="text-xl font-semibold">
                {result.verified
                  ? "Verified ✅"
                  : "Not Verified"}
              </h2>
  
              <p className="mt-2">
                {result.message}
              </p>
  
              <p className="mt-2">
                Status:{" "}
                {result.verification_status}
              </p>
  
            </div>
          )}
  
        </div>
      </DashboardLayout>
    );
  }