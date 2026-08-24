import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  createEvent,
} from "../../api/admin";

import {
  getAvailableSkills,
} from "../../api/volunteers";

import type {
  Skill,
} from "../../types/volunteer";


export default function CreateEvent() {
  const navigate =
    useNavigate();

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
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");

  const [
    startDate,
    setStartDate,
  ] =
    useState("");

  const [
    endDate,
    setEndDate,
  ] =
    useState("");

  const [
    registrationDeadline,
    setRegistrationDeadline,
  ] =
    useState("");

  const [
    capacity,
    setCapacity,
  ] =
    useState(1);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  useEffect(() => {
    getAvailableSkills()
      .then(setSkills)
      .catch(console.error);
  }, []);


  function toggleSkill(
    skillId: number,
  ) {
    setSelectedSkills(
      (current) =>
        current.includes(
          skillId,
        )
          ? current.filter(
              (id) =>
                id !==
                skillId,
            )
          : [
              ...current,
              skillId,
            ],
    );
  }


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await createEvent({
        title,
        description,
        location,

        start_date:
          startDate,

        end_date:
          endDate,

        registration_deadline:
          registrationDeadline,

        volunteer_capacity:
          capacity,

        required_skill_ids:
          selectedSkills,
      });

      navigate(
        "/dashboard/admin/events",
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to create event. Make sure your NGO is verified and all dates are valid.",
      );

    } finally {
      setSubmitting(false);
    }
  }


  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800";


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-4xl space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            New Opportunity
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Create Event
          </h1>

          <p className="mt-1 text-slate-500">
            Create a new volunteer event
            for your NGO.
          </p>
        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >


          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Basic Information
            </h2>


            <div className="mt-5 space-y-5">

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Event Title
                </label>

                <input
                  value={
                    title
                  }
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>


              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={
                    description
                  }
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>


              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Location
                </label>

                <input
                  value={
                    location
                  }
                  onChange={(
                    event,
                  ) =>
                    setLocation(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>

            </div>

          </section>


          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Schedule & Capacity
            </h2>


            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Registration Deadline
                </label>

                <input
                  type="datetime-local"
                  value={
                    registrationDeadline
                  }
                  onChange={(
                    event,
                  ) =>
                    setRegistrationDeadline(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>


              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Volunteer Capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    capacity
                  }
                  onChange={(
                    event,
                  ) =>
                    setCapacity(
                      Number(
                        event
                          .target
                          .value,
                      ),
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>


              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    startDate
                  }
                  onChange={(
                    event,
                  ) =>
                    setStartDate(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>


              <div>
                <label className="text-sm font-semibold text-slate-700">
                  End Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    endDate
                  }
                  onChange={(
                    event,
                  ) =>
                    setEndDate(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  className={
                    inputClass
                  }
                />
              </div>

            </div>

          </section>


          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Required Skills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select any skills volunteers
              should have for this event.
            </p>


            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

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
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        selected
                          ? "border-blue-300 bg-blue-100/70 text-blue-800"
                          : "border-slate-300 bg-[#eaf0f5] text-slate-700"
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
                        className="accent-blue-600"
                      />

                      {
                        skill.name
                      }
                    </label>
                  );
                },
              )}

            </div>

          </section>


          {error && (
            <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
              {error}
            </div>
          )}


          <div className="flex justify-end">

            <button
              type="submit"
              disabled={
                submitting
              }
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Event"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}