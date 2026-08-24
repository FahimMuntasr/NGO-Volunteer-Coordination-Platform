import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getVolunteerProfile,
  getAvailableSkills,
  updateVolunteerProfile,
} from "../api/volunteers";

import type {
  VolunteerProfile,
  Skill,
} from "../types/volunteer";


export default function Profile() {
  const [
    profile,
    setProfile,
  ] =
    useState<VolunteerProfile | null>(
      null,
    );

  const [
    skills,
    setSkills,
  ] =
    useState<Skill[]>([]);

  const [
    selectedSkills,
    setSelectedSkills,
  ] =
    useState<number[]>([]);

  const [
    customSkillInput,
    setCustomSkillInput,
  ] =
    useState("");

  const [
    customSkills,
    setCustomSkills,
  ] =
    useState<string[]>([]);

  const [
    availabilityNotes,
    setAvailabilityNotes,
  ] =
    useState("");

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
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const [
          profileData,
          skillsData,
        ] =
          await Promise.all([
            getVolunteerProfile(),
            getAvailableSkills(),
          ]);

        setProfile(
          profileData,
        );

        setSkills(
          skillsData,
        );

        setAvailabilityNotes(
          profileData
            .availability_notes ||
            "",
        );

        setSelectedSkills(
          profileData.skills.map(
            (skill) =>
              skill.id,
          ),
        );

      } catch (err) {
        console.error(
          "Failed to load volunteer profile:",
          err,
        );

        setError(
          "Failed to load your profile. Please try again.",
        );

      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);


  function updateProfileField(
    field:
      | "first_name"
      | "last_name"
      | "email"
      | "phone",
    value: string,
  ) {
    setProfile(
      (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          [field]: value,
        };
      },
    );

    setMessage("");
    setError("");
  }


  function toggleSkill(
    skillId: number,
  ) {
    setSelectedSkills(
      (currentSkills) => {
        if (
          currentSkills.includes(
            skillId,
          )
        ) {
          return currentSkills.filter(
            (id) =>
              id !== skillId,
          );
        }

        return [
          ...currentSkills,
          skillId,
        ];
      },
    );

    setMessage("");
    setError("");
  }


  function addCustomSkill() {
    const name =
      customSkillInput.trim();

    if (!name) {
      return;
    }

    const existingSkill =
      skills.find(
        (skill) =>
          skill.name.toLowerCase() ===
          name.toLowerCase(),
      );

    if (existingSkill) {
      setSelectedSkills(
        (current) => {
          if (
            current.includes(
              existingSkill.id,
            )
          ) {
            return current;
          }

          return [
            ...current,
            existingSkill.id,
          ];
        },
      );

      setCustomSkillInput("");
      return;
    }

    const alreadyAdded =
      customSkills.some(
        (skill) =>
          skill.toLowerCase() ===
          name.toLowerCase(),
      );

    if (!alreadyAdded) {
      setCustomSkills(
        (current) => [
          ...current,
          name,
        ],
      );
    }

    setCustomSkillInput("");
    setMessage("");
    setError("");
  }


  function removeCustomSkill(
    skillName: string,
  ) {
    setCustomSkills(
      (current) =>
        current.filter(
          (skill) =>
            skill !==
            skillName,
        ),
    );
  }


  async function handleSave() {
    if (!profile) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedProfile =
        await updateVolunteerProfile({
          first_name:
            profile.first_name,

          last_name:
            profile.last_name,

          email:
            profile.email,

          phone:
            profile.phone,

          skill_ids:
            selectedSkills,

          custom_skill_names:
            customSkills,

          availability_notes:
            availabilityNotes,
        });

      const refreshedSkills =
        await getAvailableSkills();

      setSkills(
        refreshedSkills,
      );

      setProfile(
        updatedProfile,
      );

      setSelectedSkills(
        updatedProfile.skills.map(
          (skill) =>
            skill.id,
        ),
      );

      setAvailabilityNotes(
        updatedProfile
          .availability_notes ||
          "",
      );

      setCustomSkills([]);
      setCustomSkillInput("");

      setMessage(
        "Profile updated successfully.",
      );

    } catch (err) {
      console.error(
        "Failed to update volunteer profile:",
        err,
      );

      setError(
        "Failed to update your profile. Please try again.",
      );

    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <DashboardLayout>

        <div className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-8">

          <div className="flex items-center gap-3 text-slate-500">

            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />

            Loading profile...

          </div>

        </div>

      </DashboardLayout>
    );
  }


  if (!profile) {
    return (
      <DashboardLayout>

        <div className="rounded-2xl border border-red-200 bg-red-100/60 p-6 text-red-700">
          {error ||
            "Unable to load your profile."}
        </div>

      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-5xl space-y-6">


        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#263449] to-[#31445f] p-7 text-slate-100 shadow-lg sm:p-8">

          <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-blue-400/10" />

          <div className="absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-teal-400/10" />


          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <div className="mb-3 inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-200">
                Volunteer Profile
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                My Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Keep your personal
                information, skills, and
                volunteer availability up
                to date.
              </p>

            </div>


            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl font-bold text-blue-100 ring-1 ring-blue-300/20">

              {(
                `${profile.first_name?.[0] ?? ""}${
                  profile.last_name?.[0] ?? ""
                }` ||
                profile.username.slice(
                  0,
                  2,
                )
              ).toUpperCase()}

            </div>

          </div>

        </section>


        {/* Message */}

        {message && (

          <div className="rounded-2xl border border-emerald-200 bg-emerald-100/60 px-5 py-4 text-sm font-medium text-emerald-700">
            ✓ {message}
          </div>

        )}


        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-100/60 px-5 py-4 text-sm text-red-700">
            {error}
          </div>

        )}


        {/* Personal Information */}

        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Account
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your contact and
              account information.
            </p>

          </div>


          <div className="mt-6 grid gap-5 md:grid-cols-2">


            {/* Username */}

            <div>

              <label className="text-sm font-semibold text-slate-700">
                Username
              </label>

              <input
                value={
                  profile.username
                }
                disabled
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#dfe7ee] px-4 py-3 text-slate-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Username cannot be
                changed.
              </p>

            </div>


            {/* Email */}

            <div>

              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                value={
                  profile.email
                }
                onChange={(
                  event,
                ) =>
                  updateProfileField(
                    "email",
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800"
              />

            </div>


            {/* First Name */}

            <div>

              <label className="text-sm font-semibold text-slate-700">
                First Name
              </label>

              <input
                value={
                  profile.first_name
                }
                onChange={(
                  event,
                ) =>
                  updateProfileField(
                    "first_name",
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800"
              />

            </div>


            {/* Last Name */}

            <div>

              <label className="text-sm font-semibold text-slate-700">
                Last Name
              </label>

              <input
                value={
                  profile.last_name
                }
                onChange={(
                  event,
                ) =>
                  updateProfileField(
                    "last_name",
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800"
              />

            </div>


            {/* Phone */}

            <div className="md:col-span-2">

              <label className="text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <input
                value={
                  profile.phone
                }
                onChange={(
                  event,
                ) =>
                  updateProfileField(
                    "phone",
                    event.target
                      .value,
                  )
                }
                placeholder="Enter your phone number"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800"
              />

            </div>

          </div>

        </section>


        {/* Statistics */}

        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Contribution
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Volunteer Statistics
          </h2>


          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-blue-100/60 p-5">

              <p className="text-sm font-semibold text-blue-700">
                Total Volunteer Hours
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-800">
                {
                  profile.total_hours
                }
              </p>

            </div>


            <div className="rounded-2xl bg-teal-100/60 p-5">

              <p className="text-sm font-semibold text-teal-700">
                Completed Events
              </p>

              <p className="mt-2 text-3xl font-bold text-teal-800">
                {
                  profile.completed_events
                }
              </p>

            </div>

          </div>

        </section>


        {/* Skills */}

        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Capabilities
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Skills
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select existing skills or add
            something new.
          </p>


          <div className="mt-6">

            <h3 className="text-sm font-semibold text-slate-700">
              Existing Skills
            </h3>


            {skills.length === 0 ? (

              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-[#eaf0f5] p-6 text-sm text-slate-500">
                No skills are currently
                available.
              </div>

            ) : (

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {skills.map(
                  (skill) => {

                    const selected =
                      selectedSkills.includes(
                        skill.id,
                      );

                    return (
                      <label
                        key={
                          skill.id
                        }
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                          selected
                            ? "border-blue-300 bg-blue-100/60 text-blue-800"
                            : "border-slate-300/70 bg-[#eaf0f5] text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleSkill(
                              skill.id,
                            )
                          }
                          className="h-4 w-4 accent-blue-600"
                        />

                        <span className="text-sm font-medium">
                          {
                            skill.name
                          }
                        </span>

                      </label>
                    );
                  },
                )}

              </div>

            )}

          </div>


          {/* Custom Skill */}

          <div className="mt-7 border-t border-slate-300/60 pt-6">

            <h3 className="text-sm font-semibold text-slate-700">
              Add Your Own Skill
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Can't find your skill in
              the list? Add it here.
            </p>


            <div className="mt-4 flex flex-col gap-3 sm:flex-row">

              <input
                value={
                  customSkillInput
                }
                onChange={(
                  event,
                ) =>
                  setCustomSkillInput(
                    event.target
                      .value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();

                    addCustomSkill();
                  }
                }}
                placeholder="Example: Photography"
                className="flex-1 rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800"
              />

              <button
                type="button"
                onClick={
                  addCustomSkill
                }
                className="rounded-xl bg-[#263449] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#31445f]"
              >
                Add Skill
              </button>

            </div>


            {customSkills.length >
              0 && (

              <div className="mt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  New skills waiting to
                  save
                </p>


                <div className="mt-3 flex flex-wrap gap-2">

                  {customSkills.map(
                    (skill) => (

                      <div
                        key={
                          skill
                        }
                        className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-3 py-1.5 text-sm font-medium text-blue-700"
                      >

                        {skill}

                        <button
                          type="button"
                          onClick={() =>
                            removeCustomSkill(
                              skill,
                            )
                          }
                          className="ml-1 text-blue-500 transition hover:text-red-600"
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>

                      </div>

                    ),
                  )}

                </div>

              </div>

            )}

          </div>

        </section>


        {/* Availability */}

        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Schedule
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Availability
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tell organizations when you
            are usually available to
            volunteer.
          </p>


          <textarea
            value={
              availabilityNotes
            }
            onChange={(
              event,
            ) => {
              setAvailabilityNotes(
                event.target
                  .value,
              );

              setMessage("");
              setError("");
            }}
            rows={5}
            placeholder="Example: Available Fridays and weekends"
            className="mt-5 w-full resize-none rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800"
          />

        </section>


        {/* Save */}

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-300/60 bg-[#e3eaf1] p-5 sm:flex-row sm:items-center">

          <div>

            <p className="font-semibold text-slate-800">
              Save your profile changes
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your updates will be used
              across your volunteer
              account.
            </p>

          </div>


          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              saving
            }
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

    </DashboardLayout>
  );
}