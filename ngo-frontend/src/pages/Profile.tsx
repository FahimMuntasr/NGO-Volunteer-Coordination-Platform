import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import {
  getAvailableSkills,
  getVolunteerProfile,
  updateVolunteerProfile,
} from "../api/volunteers";

import type {
  AvailableSkill,
  VolunteerProfile,
} from "../types/volunteer";

export default function Profile() {
  const [profile, setProfile] =
    useState<VolunteerProfile | null>(null);

  const [availableSkills, setAvailableSkills] = useState<
    AvailableSkill[]
  >([]);

  const [selectedSkills, setSelectedSkills] = useState<
    number[]
  >([]);

  const [availabilityNotes, setAvailabilityNotes] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const [profileData, skillsData] = await Promise.all([
          getVolunteerProfile(),
          getAvailableSkills(),
        ]);

        setProfile(profileData);
        setAvailableSkills(skillsData);

        setSelectedSkills(
          profileData.skills.map((skill) => skill.id),
        );

        setAvailabilityNotes(
          profileData.availability_notes,
        );
      } catch {
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleSkillToggle(skillId: number) {
    setSelectedSkills((current) => {
      if (current.includes(skillId)) {
        return current.filter((id) => id !== skillId);
      }

      return [...current, skillId];
    });
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedProfile =
        await updateVolunteerProfile({
          skill_ids: selectedSkills,
          availability_notes: availabilityNotes,
        });

      setProfile(updatedProfile);

      setSelectedSkills(
        updatedProfile.skills.map((skill) => skill.id),
      );

      setAvailabilityNotes(
        updatedProfile.availability_notes,
      );

      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <h1 className="mb-6 text-3xl font-bold">
          Profile
        </h1>

        <p className="text-gray-600">
          Loading profile...
        </p>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <h1 className="mb-6 text-3xl font-bold">
          Profile
        </h1>

        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error || "Unable to load your profile."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Volunteer Profile
          </h1>

          <p className="mt-1 text-gray-600">
            View and manage your volunteer information.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Personal Information */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">
            Personal Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">
                First Name
              </label>

              <p className="mt-1 text-gray-900">
                {profile.first_name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Name
              </label>

              <p className="mt-1 text-gray-900">
                {profile.last_name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Username
              </label>

              <p className="mt-1 text-gray-900">
                {profile.username}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Email
              </label>

              <p className="mt-1 text-gray-900">
                {profile.email}
              </p>
            </div>
          </div>
        </section>

        {/* Volunteer Statistics */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">
            Volunteer Statistics
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Total Hours
              </p>

              <p className="mt-1 text-2xl font-bold">
                {profile.total_hours}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Completed Events
              </p>

              <p className="mt-1 text-2xl font-bold">
                {profile.completed_events}
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">
            Skills
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Select the skills you can contribute to volunteer
            events.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {availableSkills.map((skill) => {
              const selected = selectedSkills.includes(
                skill.id,
              );

              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() =>
                    handleSkillToggle(skill.id)
                  }
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    selected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>

                    <span>{skill.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Availability */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">
            Availability
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Tell organizations when you are generally available
            for volunteering.
          </p>

          <textarea
            value={availabilityNotes}
            onChange={(event) =>
              setAvailabilityNotes(event.target.value)
            }
            rows={5}
            placeholder="Example: Available Fridays and weekends"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}