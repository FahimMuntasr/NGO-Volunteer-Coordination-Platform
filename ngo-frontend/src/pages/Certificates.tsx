import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import {
  getMyCertificates,
  type Certificate,
} from "../api/certificates";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<
    Certificate[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyCertificates();

        setCertificates(data);
      } catch (err) {
        console.error(
          "Failed to load certificates:",
          err,
        );

        setError(
          "Failed to load your certificates. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Certificates
          </h1>

          <p className="mt-1 text-gray-600">
            View and verify certificates earned from
            completed volunteer events.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-600">
              Loading your certificates...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          certificates.length === 0 && (
            <div className="rounded-lg border bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No certificates yet
              </h2>

              <p className="mt-2 text-gray-500">
                Certificates will appear here after you
                complete eligible volunteer events.
              </p>
            </div>
          )}

        {/* Certificates */}

        {!loading &&
          !error &&
          certificates.length > 0 && (
            <div className="grid gap-5">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="rounded-lg border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    {/* Certificate information */}

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {certificate.event_title}
                      </h2>

                      <p className="mt-1 text-gray-500">
                        Certificate #{certificate.id}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">

                        <p>
                          <span className="font-medium text-gray-900">
                            Issued:
                          </span>{" "}
                          {formatDate(
                            certificate.issued_at,
                          )}
                        </p>

                        <p>
                          <span className="font-medium text-gray-900">
                            Verification Code:
                          </span>{" "}
                          <span className="font-mono">
                            {certificate.verification_code}
                          </span>
                        </p>

                      </div>
                    </div>

                    {/* Actions */}

                    <div className="flex flex-col gap-2 md:min-w-40">

                      {certificate.file && (
                        <a
                          href={certificate.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
                        >
                          View Certificate
                        </a>
                      )}

                      <Link
                        to={`/certificate/verify/${certificate.verification_code}`}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-center font-medium text-gray-800 hover:bg-gray-200"
                      >
                        Verify Certificate
                      </Link>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      </div>
    </DashboardLayout>
  );
}