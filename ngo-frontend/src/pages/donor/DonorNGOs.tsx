import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getVerifiedNGOs,
  type VerifiedNGO,
} from "../../api/donations";


export default function DonorNGOs() {
  const [
    ngos,
    setNGOs,
  ] =
    useState<
      VerifiedNGO[]
    >([]);

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
    getVerifiedNGOs()
      .then(
        setNGOs,
      )
      .catch(() =>
        setError(
          "Unable to load verified NGOs.",
        ),
      )
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Verified Organizations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Browse NGOs
          </h1>

          <p className="mt-1 text-slate-500">
            Explore verified NGOs and
            choose an organization to
            support.
          </p>
        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading NGOs...
          </div>

        ) : ngos.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-10 text-center text-slate-500">
            No verified NGOs are
            available right now.
          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {ngos.map(
              (ngo) => (

                <article
                  key={
                    ngo.id
                  }
                  className="flex flex-col rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-xl font-bold text-teal-700">
                    {ngo.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {
                      ngo.name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      ngo.address
                    }
                  </p>

                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                    {ngo.description ||
                      "Verified NGO registered on the platform."}
                  </p>


                  <div className="mt-auto pt-5">

                    <div className="rounded-xl bg-emerald-100/60 px-3 py-2 text-sm font-semibold text-emerald-700">
                      ✓ Verified Organization
                    </div>

                    <Link
                      to={`/dashboard/donor/donate?ngo=${ngo.id}`}
                      className="mt-3 block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      Donate to this NGO
                    </Link>

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