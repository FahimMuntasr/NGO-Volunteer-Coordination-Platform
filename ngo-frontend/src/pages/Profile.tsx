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

  // Load profile and available skills
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

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

  // Toggle a skill
  function toggleSkill(skillId: number) {
    setSelectedSkills((currentSkills) => {
      if (currentSkills.includes(skillId)) {
        return currentSkills.filter(
          (id) => id !== skillId,
        );
      }

      return [...currentSkills, skillId];
    });
  }

  // Save profile
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
        {/* Page Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            View and manage your volunteer profile.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="border rounded-lg p-6">
            <p>Loading profile...</p>
          </div>
        )}

        {/* Error */}

        {!loading && error && !profile && (
          <div className="border border-red-300 bg-red-50 rounded-lg p-6">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Profile */}

        {!loading && profile && (
          <div className="space-y-6">

            {/* Personal Information */}

            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-5">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <p className="text-sm text-gray-500">
                    Username
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.username}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    First Name
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.first_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Last Name
                  </p>

                  <p className="mt-1 font-medium">
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

            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-5">
                Volunteer Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="border rounded-lg p-5">
                  <p className="text-sm text-gray-500">
                    Total Hours
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {profile.total_hours}
                  </p>
                </div>

                <div className="border rounded-lg p-5">
                  <p className="text-sm text-gray-500">
                    Completed Events
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {profile.completed_events}
                  </p>
                </div>

              </div>
            </section>

            {/* Skills */}

            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">
                Skills
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Select the skills you have.
              </p>

              {skills.length === 0 ? (
                <p className="text-gray-500">
                  No skills are currently available.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {skills.map((skill) => (
                    <label
                      key={skill.id}
                      className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer"
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

                      <span>
                        {skill.name}
                      </span>
                    </label>
                  ))}

                </div>
              )}
            </section>

            {/* Availability */}

            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">
                Availability
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Tell organizations when you are available
                for volunteer activities.
              </p>

              <textarea
                value={availabilityNotes}
                onChange={(event) =>
                  setAvailabilityNotes(
                    event.target.value,
                  )
                }
                rows={5}
                placeholder="Example: Available Fridays and weekends"
                className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2"
              />
            </section>

            {/* Save Area */}

            <section className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-black text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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