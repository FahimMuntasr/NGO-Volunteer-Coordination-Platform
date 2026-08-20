import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { verifyCertificate } from "../api/certificates";

type VerificationResult = {
  valid: boolean;
  verification_code: string;
  volunteer_name: string;
  event_title: string;
  issued_at: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CertificateVerification() {
  const { verificationCode } = useParams<{
    verificationCode: string;
  }>();

  const [certificate, setCertificate] =
    useState<VerificationResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verify() {
      if (!verificationCode) {
        setError("No verification code was provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await verifyCertificate(verificationCode);

        setCertificate(data);
      } catch (err) {
        console.error(
          "Certificate verification failed:",
          err,
        );

        setCertificate(null);

        setError(
          "This certificate could not be verified.",
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [verificationCode]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Certificate Verification
          </h1>

          <p className="mt-2 text-gray-600">
            Verify the authenticity of a volunteer certificate.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            <p className="text-gray-600">
              Verifying certificate...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-xl border border-red-300 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl text-red-600">
                ✕
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Certificate Not Found
            </h2>

            <p className="mt-2 text-gray-600">
              {error}
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Valid certificate */}

        {!loading &&
          !error &&
          certificate && (
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

              {/* Verification banner */}

              <div className="bg-green-50 px-6 py-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <span className="text-2xl text-green-600">
                    ✓
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-green-700">
                  Certificate Verified
                </h2>

                <p className="mt-1 text-green-700">
                  This certificate is valid.
                </p>
              </div>

              {/* Certificate information */}

              <div className="space-y-5 p-6">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Volunteer
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {certificate.volunteer_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Event
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {certificate.event_title}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Issued
                  </p>

                  <p className="mt-1 text-gray-900">
                    {formatDate(
                      certificate.issued_at,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Verification Code
                  </p>

                  <p className="mt-1 break-all rounded-lg bg-gray-100 p-3 font-mono text-sm text-gray-700">
                    {certificate.verification_code}
                  </p>
                </div>

              </div>
            </div>
          )}

        {/* Footer */}

        <p className="mt-6 text-center text-sm text-gray-500">
          NGO Volunteer Coordination Platform
        </p>

      </div>
    </div>
  );
}