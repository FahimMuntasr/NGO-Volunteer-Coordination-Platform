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
  getCoordinators,
  type CoordinatorOption,
} from "../../api/admin";

import {
  getAvailableSkills,
} from "../../api/volunteers";

import type {
  Skill,
} from "../../types/volunteer";


function getCurrentLocalDateTime() {
  const now = new Date();

  now.setMinutes(
    now.getMinutes() - now.getTimezoneOffset()
  );

  return now
    .toISOString()
    .slice(0, 16);
}


export default function CreateEvent() {
  const navigate = useNavigate();

  const [
    skills,
    setSkills,
  ] = useState<Skill[]>([]);

  const [
    selectedSkills,
    setSelectedSkills,
  ] = useState<number[]>([]);

  const [
    coordinators,
    setCoordinators,
  ] = useState<CoordinatorOption[]>([]);

  const [
    selectedCoordinatorId,
    setSelectedCoordinatorId,
  ] = useState<number | "">("");

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    registrationDeadline,
    setRegistrationDeadline,
  ] = useState("");

  const [
    capacityMode,
    setCapacityMode,
  ] = useState<"FIXED" | "UNLIMITED">("FIXED");

  const [
    capacity,
    setCapacity,
  ] = useState(1);

  const [
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const minimumDateTime =
    getCurrentLocalDateTime();


  useEffect(() => {
    getAvailableSkills()
      .then(setSkills)
      .catch(console.error);

    getCoordinators()
      .then(setCoordinators)
      .catch(console.error);
  }, []);


  function toggleSkill(
    skillId: number,
  ) {
    setSelectedSkills(
      (current) =>
        current.includes(skillId)
          ? current.filter(
              (id) => id !== skillId,
            )
          : [
              ...current,
              skillId,
            ],
    );
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");


    const now = new Date();

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    const deadline =
      new Date(registrationDeadline);


    // =========================================
    // Frontend date validation
    // =========================================

    if (start <= now) {
      setError(
        "The event start date must be in the future.",
      );

      return;
    }


    if (deadline <= now) {
      setError(
        "The registration deadline must be in the future.",
      );

      return;
    }


    if (end <= start) {
      setError(
        "The event end date must be after the start date.",
      );

      return;
    }


    if (deadline >= start) {
      setError(
        "The registration deadline must be before the event starts.",
      );

      return;
    }


    try {
      setSubmitting(true);

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

        capacity_mode:
          capacityMode,

        volunteer_capacity:
          capacityMode === "FIXED"
            ? capacity
            : null,

        required_skill_ids:
          selectedSkills,

        ...(selectedCoordinatorId !== ""
          ? { coordinator_id: selectedCoordinatorId }
          : {}),
      });


      navigate(
        "/dashboard/admin/events",
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to create event. Make sure your NGO is verified and all information is valid.",
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


        {/* =========================================
            Header
        ========================================= */}

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
          onSubmit={handleSubmit}
          className="space-y-6"
        >


          {/* =========================================
              Basic Information
          ========================================= */}

          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Basic Information
            </h2>


            <div className="mt-5 space-y-5">


              <div>

                <label
                  htmlFor="event-title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Event Title
                </label>

                <input
                  id="event-title"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  required
                  className={inputClass}
                />

              </div>


              <div>

                <label
                  htmlFor="event-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  rows={5}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  required
                  className={inputClass}
                />

              </div>


              <div>

                <label
                  htmlFor="event-location"
                  className="text-sm font-semibold text-slate-700"
                >
                  Location
                </label>

                <input
                  id="event-location"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value,
                    )
                  }
                  required
                  className={inputClass}
                />

              </div>

            </div>

          </section>


          {/* =========================================
              Schedule & Capacity
          ========================================= */}

          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Schedule & Capacity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The registration deadline must
              be before the event starts.
            </p>


            <div className="mt-5 grid gap-5 md:grid-cols-2">


              {/* Registration Deadline */}

              <div>

                <label
                  htmlFor="registration-deadline"
                  className="text-sm font-semibold text-slate-700"
                >
                  Registration Deadline
                </label>

                <input
                  id="registration-deadline"
                  type="datetime-local"
                  value={registrationDeadline}

                  min={minimumDateTime}

                  max={
                    startDate || undefined
                  }

                  onChange={(event) =>
                    setRegistrationDeadline(
                      event.target.value,
                    )
                  }

                  required
                  className={inputClass}
                />

              </div>


              {/* Capacity */}

              <div>

                <label
                  htmlFor="capacity-mode"
                  className="text-sm font-semibold text-slate-700"
                >
                  Volunteer Capacity
                </label>

                <select
                  id="capacity-mode"
                  value={capacityMode}
                  onChange={(event) =>
                    setCapacityMode(
                      event.target.value as
                        "FIXED" | "UNLIMITED",
                    )
                  }
                  className={inputClass}
                >
                  <option value="FIXED">
                    Fixed capacity
                  </option>
                  <option value="UNLIMITED">
                    Unlimited volunteers
                  </option>
                </select>

                {capacityMode === "FIXED" && (
                  <input
                    id="volunteer-capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(event) =>
                      setCapacity(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    required
                    className={inputClass}
                  />
                )}

                <p className="mt-2 text-xs text-slate-500">
                  {capacityMode === "FIXED"
                    ? "Set the maximum number of volunteers who can be approved."
                    : "No maximum number of volunteers will be enforced."}
                </p>

              </div>


              {/* Start */}

              <div>

                <label
                  htmlFor="start-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  Start Date
                </label>

                <input
                  id="start-date"
                  type="datetime-local"

                  value={startDate}

                  min={minimumDateTime}

                  onChange={(event) => {
                    const newStart =
                      event.target.value;

                    setStartDate(
                      newStart,
                    );


                    // If the selected end date
                    // is no longer valid,
                    // clear it.
                    if (
                      endDate &&
                      new Date(endDate)
                      <= new Date(newStart)
                    ) {
                      setEndDate("");
                    }


                    // If the deadline is
                    // after the new start,
                    // clear it.
                    if (
                      registrationDeadline &&
                      new Date(
                        registrationDeadline,
                      ) >= new Date(newStart)
                    ) {
                      setRegistrationDeadline(
                        "",
                      );
                    }
                  }}

                  required
                  className={inputClass}
                />

              </div>


              {/* End */}

              <div>

                <label
                  htmlFor="end-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  End Date
                </label>

                <input
                  id="end-date"
                  type="datetime-local"

                  value={endDate}

                  min={
                    startDate
                    || minimumDateTime
                  }

                  onChange={(event) =>
                    setEndDate(
                      event.target.value,
                    )
                  }

                  required
                  className={inputClass}
                />

              </div>

            </div>

          </section>


          {/* =========================================
              Required Skills
          ========================================= */}

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
                      key={skill.id}
                      className={
                        `flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                          selected
                            ? "border-blue-300 bg-blue-100/70 text-blue-800"
                            : "border-slate-300 bg-[#eaf0f5] text-slate-700"
                        }`
                      }
                    >

                      <input
                        type="checkbox"

                        checked={selected}

                        onChange={() =>
                          toggleSkill(
                            skill.id,
                          )
                        }

                        className="accent-blue-600"
                      />

                      {skill.name}

                    </label>
                  );
                },
              )}

            </div>

          </section>


          {/* =========================================
              Coordinator
          ========================================= */}

          <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Coordinator (Optional)
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Assign a coordinator now, or leave this
              blank and assign one later from the
              Assign Coordinator page.
            </p>


            <div className="mt-5">

              <select
                value={
                  selectedCoordinatorId
                }
                onChange={(
                  event,
                ) =>
                  setSelectedCoordinatorId(
                    event.target.value
                      ? Number(event.target.value)
                      : "",
                  )
                }
                className={inputClass}
              >
                <option value="">
                  No coordinator yet
                </option>

                {coordinators.map(
                  (coordinator) => (
                    <option
                      key={coordinator.id}
                      value={coordinator.id}
                    >
                      {coordinator.first_name || coordinator.last_name
                        ? `${coordinator.first_name} ${coordinator.last_name}`.trim()
                        : coordinator.username}
                    </option>
                  ),
                )}
              </select>

            </div>

          </section>


          {/* =========================================
              Error
          ========================================= */}

          {error && (

            <div className="rounded-2xl border border-red-200 bg-red-100/60 p-4 text-red-700">
              {error}
            </div>

          )}


          {/* =========================================
              Submit
          ========================================= */}

          <div className="flex justify-end">

            <button
              type="submit"

              disabled={submitting}

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