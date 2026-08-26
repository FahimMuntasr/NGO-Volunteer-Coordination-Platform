import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  downloadCertificate,
  getMyCertificates,
  type Certificate,
} from "../api/certificates";


function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}


export default function Certificates() {
  const [
    certificates,
    setCertificates,
  ] =
    useState<Certificate[]>(
      [],
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


  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<number | null>(
      null,
    );


  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyCertificates();

        setCertificates(
          data,
        );

      } catch (err) {
        console.error(
          err,
        );

        setError(
          "Failed to load your certificates.",
        );

      } finally {
        setLoading(
          false,
        );
      }
    }


    loadCertificates();

  }, []);


  async function handleDownload(
    certificate: Certificate,
  ) {
    try {
      setDownloadingId(
        certificate.id,
      );

      setError("");


      const blob =
        await downloadCertificate(
          certificate.id,
        );


      const url =
        URL.createObjectURL(
          blob,
        );


      const link =
        document.createElement(
          "a",
        );


      link.href =
        url;

      link.download =
        `certificate_${certificate.id}.pdf`;


      document.body.appendChild(
        link,
      );

      link.click();

      document.body.removeChild(
        link,
      );


      URL.revokeObjectURL(
        url,
      );

    } catch (err) {
      console.error(
        "Certificate download failed:",
        err,
      );

      setError(
        "Failed to download certificate.",
      );

    } finally {
      setDownloadingId(
        null,
      );
    }
  }


  return (
    <DashboardLayout>

      <div className="space-y-6">


        {/* Header */}

        <section className="rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
            Achievements
          </div>


          <h1 className="mt-3 text-3xl font-bold">
            My Certificates
          </h1>


          <p className="mt-2 max-w-2xl text-slate-300">
            View, download, and verify
            certificates earned from
            completed volunteer events.
          </p>

        </section>


        {/* Error */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">

            {error}

          </div>

        )}


        {/* Loading */}

        {loading ? (

          <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

            <div className="flex items-center gap-3 text-slate-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

              <span>
                Loading certificates...
              </span>

            </div>

          </div>

        ) : certificates.length ===
          0 ? (

          /* Empty State */

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">

              ✓

            </div>


            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No certificates yet
            </h2>


            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Certificates will appear
              here after you successfully
              complete eligible volunteer
              events.
            </p>


            <Link
              to="/dashboard/events"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Events
            </Link>

          </div>

        ) : (

          /* Certificate Grid */

          <div className="grid gap-5 md:grid-cols-2">

            {certificates.map(
              (
                certificate,
              ) => (

                <article
                  key={
                    certificate.id
                  }
                  className="overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f4f7fa] shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
                >

                  {/* Accent */}

                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-teal-400" />


                  <div className="p-6">

                    {/* Certificate ID */}

                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">

                      Certificate #

                      {
                        certificate.id
                      }

                    </p>


                    {/* Event */}

                    <h2 className="mt-2 text-xl font-bold text-slate-900">

                      {
                        certificate.event_title
                      }

                    </h2>


                    {/* Volunteer */}

                    {certificate.volunteer_name && (

                      <p className="mt-1 text-sm text-slate-500">

                        Awarded to{" "}

                        <span className="font-semibold text-slate-700">

                          {
                            certificate.volunteer_name
                          }

                        </span>

                      </p>

                    )}


                    {/* Information */}

                    <div className="mt-5 space-y-3">


                      {/* Issued Date */}

                      <div className="rounded-xl bg-[#eaf0f5] p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Issued
                        </p>


                        <p className="mt-1 font-semibold text-slate-700">

                          {formatDate(
                            certificate.issued_at,
                          )}

                        </p>

                      </div>


                      {/* Verification Code */}

                      <div className="rounded-xl bg-[#eaf0f5] p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Verification Code
                        </p>


                        <p className="mt-1 break-all font-mono text-sm text-slate-700">

                          {
                            certificate.verification_code
                          }

                        </p>

                      </div>

                    </div>


                    {/* Actions */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">


                      {/* Download */}

                      <button
                        type="button"
                        disabled={
                          downloadingId ===
                          certificate.id
                        }
                        onClick={() =>
                          handleDownload(
                            certificate,
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {downloadingId ===
                        certificate.id ? (

                          <>

                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                            Generating...

                          </>

                        ) : (

                          <>

                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="h-4 w-4"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 3v12" />

                              <path d="m7 10 5 5 5-5" />

                              <path d="M5 21h14" />
                            </svg>

                            Download Certificate

                          </>

                        )}

                      </button>


                      {/* Verify */}

                      <Link
                        to={`/certificate/verify/${certificate.verification_code}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-[#e3eaf1] px-4 py-3 text-center font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                      >

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-4 w-4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 12 2 2 4-4" />

                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                          />
                        </svg>

                        Verify

                      </Link>

                    </div>


                    {/* Verification Message */}

                    <div className="mt-5 rounded-xl border border-teal-200/60 bg-teal-50/60 px-4 py-3">

                      <p className="text-sm text-teal-800">

                        This certificate can
                        be independently
                        verified using its
                        verification code.

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