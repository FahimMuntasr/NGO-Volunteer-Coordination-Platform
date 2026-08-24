import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
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
        console.error(err);

        setError(
          "Failed to load your certificates.",
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


        <section className="rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
            Achievements
          </div>

          <h1 className="mt-3 text-3xl font-bold">
            My Certificates
          </h1>

          <p className="mt-2 text-slate-300">
            View and verify certificates
            earned from completed volunteer
            events.
          </p>

        </section>


        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading certificates...
          </div>

        ) : certificates.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f4f7fa] p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              ✓
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No certificates yet
            </h2>

            <p className="mt-2 text-slate-500">
              Certificates will appear
              after eligible events are
              completed.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2">

            {certificates.map(
              (certificate) => (

                <article
                  key={
                    certificate.id
                  }
                  className="overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f4f7fa] shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
                >

                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-teal-400" />


                  <div className="p-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Certificate #
                      {
                        certificate.id
                      }
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {
                        certificate.event_title
                      }
                    </h2>


                    <div className="mt-5 space-y-3">

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


                      <div className="rounded-xl bg-[#eaf0f5] p-4">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Verification Code
                        </p>

                        <p className="mt-1 break-all font-mono text-sm text-slate-700">
                          {
                            certificate.verification_code
                          }
                        </p>
                      </div>

                    </div>


                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      {certificate.file && (
                        <a
                          href={
                            certificate.file
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                        >
                          View Certificate
                        </a>
                      )}


                      <Link
                        to={`/certificate/verify/${certificate.verification_code}`}
                        className="rounded-xl border border-slate-300 bg-[#e3eaf1] px-4 py-3 text-center font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                      >
                        Verify
                      </Link>

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