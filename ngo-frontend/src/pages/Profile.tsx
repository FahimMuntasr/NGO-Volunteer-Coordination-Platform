import { useEffect, useState } from "react";

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
  const [profile, setProfile] =
    useState<VolunteerProfile | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);

  const [selectedSkills, setSelectedSkills] =
    useState<number[]>([]);

  const [availabilityNotes, setAvailabilityNotes] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const [profileData, skillsData] =
          await Promise.all([
            getVolunteerProfile(),
            getAvailableSkills(),
          ]);

        setProfile(profileData);
        setSkills(skillsData);

        setAvailabilityNotes(
          profileData.availability_notes || "",
        );

        setSelectedSkills(
          profileData.skills.map(
            (skill) => skill.id,
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

  function toggleSkill(skillId: number) {
    setSelectedSkills((currentSkills) => {
      if (currentSkills.includes(skillId)) {
        return currentSkills.filter(
          (id) => id !== skillId,
        );
      }

      return [...currentSkills, skillId];
    });

    setMessage("");
    setError("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedProfile =
        await updateVolunteerProfile({
          skill_ids: selectedSkills,
          availability_notes: availabilityNotes,
        });

      setProfile(updatedProfile);

      setSelectedSkills(
        updatedProfile.skills.map(
          (skill) => skill.id,
        ),
      );

      setAvailabilityNotes(
        updatedProfile.availability_notes || "",
      );

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            View and manage your volunteer profile.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-lg border bg-white p-6">
            <p className="text-gray-600">
              Loading profile...
            </p>
          </div>
        )}

        {/* Initial Error */}

        {!loading && error && !profile && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Profile */}

        {!loading && profile && (
          <div className="space-y-6">

            {/* Personal Information */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Personal Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <p className="text-sm text-gray-500">
                    Username
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {profile.username}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    First Name
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {profile.first_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Last Name
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {profile.last_name}
                  </p>
                </div>

              </div>

              <p className="mt-5 text-sm text-gray-500">
                Personal information is managed by your
                account and cannot be edited here.
              </p>
            </section>

            {/* Statistics */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Volunteer Statistics
              </h2>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-500">
                    Total Hours
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {profile.total_hours}
                  </p>
                </div>

                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-500">
                    Completed Events
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {profile.completed_events}
                  </p>
                </div>

              </div>
            </section>

            {/* Skills */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Skills
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Select the skills you have.
              </p>

              {skills.length === 0 ? (
                <p className="text-gray-500">
                  No skills are currently available.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <label
                      key={skill.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                        selectedSkills.includes(
                          skill.id,
                        )
                          ? "border-blue-400 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(
                          skill.id,
                        )}
                        onChange={() =>
                          toggleSkill(skill.id)
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-gray-900">
                        {skill.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Availability */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Availability
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Tell organizations when you are available
                for volunteer activities.
              </p>

              <textarea
                value={availabilityNotes}
                onChange={(event) => {
                  setAvailabilityNotes(
                    event.target.value,
                  );
                  setMessage("");
                  setError("");
                }}
                rows={5}
                placeholder="Example: Available Fridays and weekends"
                className="w-full resize-none rounded-lg border p-3 focus:outline-none focus:ring-2"
              />
            </section>

            {/* Save */}

            <section className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              {message && (
                <p className="text-green-600">
                  {message}
                </p>
              )}

              {error && profile && (
                <p className="text-red-600">
                  {error}
                </p>
              )}

            </section>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}