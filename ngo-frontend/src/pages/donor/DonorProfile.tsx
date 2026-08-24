import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getDonorProfile,
  updateDonorProfile,
  type DonorProfile as DonorProfileData,
} from "../../api/accountProfiles";


export default function DonorProfile() {
  const [
    profile,
    setProfile,
  ] =
    useState<DonorProfileData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
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
    getDonorProfile()
      .then(
        setProfile,
      )
      .catch(() =>
        setError(
          "Unable to load donor profile.",
        ),
      )
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  function updateField(
    field:
      keyof DonorProfileData,
    value: string,
  ) {
    setProfile(
      (current) =>
        current
          ? {
              ...current,
              [field]:
                value,
            }
          : current,
    );

    setSuccess("");
  }


  async function handleSave() {
    if (
      !profile
    ) {
      return;
    }

    try {
      setSaving(true);

      const updated =
        await updateDonorProfile(
          {
            first_name:
              profile.first_name,

            last_name:
              profile.last_name,

            email:
              profile.email,

            phone:
              profile.phone,

            organization_name:
              profile.organization_name,

            preferred_causes:
              profile.preferred_causes,
          },
        );

      setProfile(
        updated,
      );

      setSuccess(
        "Donor profile updated successfully.",
      );

    } catch {
      setError(
        "Unable to update donor profile.",
      );

    } finally {
      setSaving(false);
    }
  }


  if (
    loading ||
    !profile
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-[#f4f7fa] p-8">
          {loading
            ? "Loading donor profile..."
            : error}
        </div>
      </DashboardLayout>
    );
  }


  const input =
    "mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3";


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-4xl space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Donor Profile
          </h1>

          <p className="mt-1 text-slate-500">
            Manage your personal and
            donor preferences.
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


        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="text-sm font-semibold">
                Username
              </label>

              <input
                disabled
                value={
                  profile.username
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#dfe7ee] p-3"
              />
            </div>


            <div>
              <label className="text-sm font-semibold">
                Phone
              </label>

              <input
                value={
                  profile.phone
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "phone",
                    event.target
                      .value,
                  )
                }
                className={
                  input
                }
              />
            </div>


            <div>
              <label className="text-sm font-semibold">
                First Name
              </label>

              <input
                value={
                  profile.first_name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "first_name",
                    event.target
                      .value,
                  )
                }
                className={
                  input
                }
              />
            </div>


            <div>
              <label className="text-sm font-semibold">
                Last Name
              </label>

              <input
                value={
                  profile.last_name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "last_name",
                    event.target
                      .value,
                  )
                }
                className={
                  input
                }
              />
            </div>


            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                value={
                  profile.email
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "email",
                    event.target
                      .value,
                  )
                }
                className={
                  input
                }
              />
            </div>


            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Organization / Company
              </label>

              <input
                value={
                  profile.organization_name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "organization_name",
                    event.target
                      .value,
                  )
                }
                className={
                  input
                }
              />
            </div>


            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Preferred Causes
              </label>

              <textarea
                rows={5}
                value={
                  profile.preferred_causes
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "preferred_causes",
                    event.target
                      .value,
                  )
                }
                placeholder="Education, healthcare, disaster relief..."
                className={
                  input
                }
              />
            </div>

          </div>


          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              saving
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>

        </section>

      </div>

    </DashboardLayout>
  );
}