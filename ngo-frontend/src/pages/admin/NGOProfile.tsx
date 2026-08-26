import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getNGOProfile,
  updateNGOProfile,
  type NGOProfile as NGOProfileData,
} from "../../api/ngoProfile";


export default function NGOProfile() {
  const [
    profile,
    setProfile,
  ] =
    useState<NGOProfileData | null>(
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
    getNGOProfile()
      .then(
        setProfile,
      )
      .catch(() =>
        setError(
          "Unable to load NGO profile.",
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
      keyof NGOProfileData,
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
        await updateNGOProfile(
          {
            admin_first_name:
              profile.admin_first_name,

            admin_last_name:
              profile.admin_last_name,

            admin_email:
              profile.admin_email,

            admin_phone:
              profile.admin_phone,

            name:
              profile.name,

            email:
              profile.email,

            address:
              profile.address,

            description:
              profile.description,
          },
        );

      setProfile(
        updated,
      );

      setSuccess(
        "NGO profile updated successfully.",
      );

    } catch {
      setError(
        "Unable to update NGO profile.",
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
            ? "Loading NGO profile..."
            : error}
        </div>
      </DashboardLayout>
    );
  }


  const input =
    "mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3";


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-5xl space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Organization
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            NGO Profile
          </h1>

          <p className="mt-1 text-slate-500">
            Manage administrator and
            organization information.
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

          <h2 className="text-xl font-bold">
            Administrator
          </h2>


          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div>
              <label className="text-sm font-semibold">
                Username
              </label>

              <input
                disabled
                value={
                  profile.admin_username
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
                  profile.admin_phone
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "admin_phone",
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
                  profile.admin_first_name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "admin_first_name",
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
                  profile.admin_last_name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "admin_last_name",
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
                Account Email
              </label>

              <input
                type="email"
                value={
                  profile.admin_email
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "admin_email",
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

        </section>


        <section className="rounded-2xl bg-[#f4f7fa] p-6">

          <h2 className="text-xl font-bold">
            Organization
          </h2>


          <div className="mt-5 space-y-5">

            <div>
              <label className="text-sm font-semibold">
                NGO Name
              </label>

              <input
                value={
                  profile.name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "name",
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
                NGO Email
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


            <div>
              <label className="text-sm font-semibold">
                Address
              </label>

              <textarea
                rows={3}
                value={
                  profile.address
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "address",
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
                Description
              </label>

              <textarea
                rows={5}
                value={
                  profile.description
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "description",
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

        </section>


        <section className="rounded-2xl bg-[#e3eaf1] p-6">

          <h2 className="text-xl font-bold text-slate-900">
            Verification
          </h2>


          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-[#f4f7fa] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Registration
              </p>

              <p className="mt-2 font-bold">
                {
                  profile.registration_number ||
                  "Not provided"
                }
              </p>
            </div>


            <div className="rounded-xl bg-[#f4f7fa] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Status
              </p>

              <p className="mt-2 font-bold">
                {
                  profile.verification_status
                }
              </p>
            </div>


            <div className="rounded-xl bg-[#f4f7fa] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Verified
              </p>

              <p className="mt-2 font-bold">
                {profile.is_verified
                  ? "✓ Yes"
                  : "No"}
              </p>
            </div>

          </div>

        </section>


        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            saving
          }
          className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white"
        >
          {saving
            ? "Saving..."
            : "Save Profile"}
        </button>

      </div>

    </DashboardLayout>
  );
}