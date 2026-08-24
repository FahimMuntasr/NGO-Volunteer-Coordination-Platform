import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  verifyCertificate,
} from "../api/certificates";


type VerificationResult = {
  valid: boolean;
  verification_code: string;
  volunteer_name: string;
  event_title: string;
  issued_at: string;
};


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}


export default function CertificateVerification() {
  const {
    verificationCode,
  } =
    useParams<{
      verificationCode:
        string;
    }>();

  const [
    certificate,
    setCertificate,
  ] =
    useState<VerificationResult | null>(
      null,
    );

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
    async function verify() {
      if (
        !verificationCode
      ) {
        setError(
          "No verification code was provided.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await verifyCertificate(
            verificationCode,
          );

        setCertificate(
          data,
        );

      } catch (err) {
        console.error(err);

        setCertificate(
          null,
        );

        setError(
          "This certificate could not be verified.",
        );

      } finally {
        setLoading(false);
      }
    }

    verify();

  }, [
    verificationCode,
  ]);


  return (
    <div className="min-h-screen bg-[#eaf0f5] px-5 py-10">

      <div className="mx-auto max-w-2xl">


        <div className="mb-8 flex items-center justify-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white">
            N
          </div>

          <div>
            <p className="font-bold text-slate-900">
              NGO Volunteer Coordination
            </p>

            <p className="text-xs text-slate-500">
              Certificate Verification
            </p>
          </div>

        </div>


        {loading && (
          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-10 text-center text-slate-500">
            Verifying certificate...
          </div>
        )}


        {!loading &&
          error && (

          <div className="rounded-3xl border border-red-200 bg-[#f4f7fa] p-8 text-center shadow-lg">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl font-bold text-red-600">
              ×
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Certificate Not Verified
            </h1>

            <p className="mt-2 text-slate-500">
              {error}
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Go to Login
            </Link>

          </div>

        )}


        {!loading &&
          !error &&
          certificate && (

          <div className="overflow-hidden rounded-3xl border border-slate-300/60 bg-[#f4f7fa] shadow-lg">

            <div className="bg-emerald-100/70 p-7 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-200 text-2xl font-bold text-emerald-700">
                ✓
              </div>

              <h1 className="mt-4 text-2xl font-bold text-emerald-800">
                Certificate Verified
              </h1>

              <p className="mt-1 text-emerald-700">
                This certificate is
                authentic.
              </p>

            </div>


            <div className="space-y-4 p-7">

              <div className="rounded-xl bg-[#eaf0f5] p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Volunteer
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800">
                  {
                    certificate.volunteer_name
                  }
                </p>
              </div>


              <div className="rounded-xl bg-[#eaf0f5] p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Event
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800">
                  {
                    certificate.event_title
                  }
                </p>
              </div>


              <div className="rounded-xl bg-[#eaf0f5] p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Issued
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {formatDate(
                    certificate.issued_at,
                  )}
                </p>
              </div>


              <div className="rounded-xl bg-[#e3eaf1] p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Verification Code
                </p>

                <p className="mt-2 break-all font-mono text-sm text-slate-700">
                  {
                    certificate.verification_code
                  }
                </p>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}