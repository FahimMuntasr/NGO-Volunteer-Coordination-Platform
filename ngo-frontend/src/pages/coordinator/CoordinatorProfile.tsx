import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getCoordinatorProfile,
  updateCoordinatorProfile,
  type CoordinatorProfile as CoordinatorProfileData,
} from "../../api/accountProfiles";


export default function CoordinatorProfile() {
  const [
    profile,
    setProfile,
  ] =
    useState<CoordinatorProfileData | null>(
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
    getCoordinatorProfile()
      .then(
        setProfile,
      )
      .catch(() =>
        setError(
          "Unable to load coordinator profile.",
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
      keyof CoordinatorProfileData,
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
      setError("");

      const updated =
        await updateCoordinatorProfile(
          {
            first_name:
              profile.first_name,

            last_name:
              profile.last_name,

            email:
              profile.email,

            phone:
              profile.phone,

            specialization:
              profile.specialization,

            experience_notes:
              profile.experience_notes,
          },
        );

      setProfile(
        updated,
      );

      setSuccess(
        "Profile updated successfully.",
      );

    } catch {
      setError(
        "Unable to update coordinator profile.",
      );

    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-[#f4f7fa] p-8">
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }


  if (!profile) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-red-100/60 p-6 text-red-700">
          {error}
        </div>
      </DashboardLayout>
    );
  }


  const input =
    "mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3";


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-4xl space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Coordinator Profile
          </h1>

          <p className="mt-1 text-slate-500">
            Manage your account and
            coordination experience.
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


        <section className="rounded-2xl bg-[#f4f7fa] p-6">

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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#dfe7ee] p-3 text-slate-500"
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
                Specialization
              </label>

              <input
                value={
                  profile.specialization
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "specialization",
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
                Experience Notes
              </label>

              <textarea
                rows={5}
                value={
                  profile.experience_notes
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "experience_notes",
                    event.target
                      .value,
                  )
                }
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