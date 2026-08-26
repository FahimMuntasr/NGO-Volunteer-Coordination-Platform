import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  registerAccount,
} from "../api/auth";

import {
  getAvailableSkills,
} from "../api/volunteers";

import type {
  UserRole,
} from "../types/auth";

import type {
  Skill,
} from "../types/volunteer";


const roleOptions: {
  value: UserRole;
  title: string;
  description: string;
}[] = [
  {
    value: "VOLUNTEER",
    title: "Volunteer",
    description:
      "Find events and contribute your skills.",
  },
  {
    value: "COORDINATOR",
    title: "Coordinator",
    description:
      "Coordinate teams and event attendance.",
  },
  {
    value: "DONOR",
    title: "Donor",
    description:
      "Support verified NGOs through donations.",
  },
  {
    value: "NGO_ADMIN",
    title: "NGO Administrator",
    description:
      "Manage an NGO, events, and volunteers.",
  },
];


export default function Register() {
  const navigate =
    useNavigate();


  // Common
  const [
    username,
    setUsername,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    role,
    setRole,
  ] =
    useState<UserRole>(
      "VOLUNTEER",
    );


  // Volunteer
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


  // Coordinator
  const [
    coordinatorSpecialization,
    setCoordinatorSpecialization,
  ] =
    useState("");

  const [
    coordinatorExperience,
    setCoordinatorExperience,
  ] =
    useState("");


  // Donor
  const [
    donorOrganization,
    setDonorOrganization,
  ] =
    useState("");

  const [
    donorPreferredCauses,
    setDonorPreferredCauses,
  ] =
    useState("");


  // NGO
  const [
    ngoName,
    setNgoName,
  ] =
    useState("");

  const [
    ngoEmail,
    setNgoEmail,
  ] =
    useState("");

  const [
    ngoAddress,
    setNgoAddress,
  ] =
    useState("");

  const [
    ngoRegistrationNumber,
    setNgoRegistrationNumber,
  ] =
    useState("");


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
    let cancelled =
      false;

    getAvailableSkills()
      .then((data) => {
        if (!cancelled) {
          setSkills(data);
        }
      })
      .catch((err) => {
        console.error(
          "Unable to load skills:",
          err,
        );
      });

    return () => {
      cancelled = true;
    };
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


  function addCustomSkill() {
    const name =
      customSkillInput.trim();

    if (!name) {
      return;
    }

    const existing =
      skills.find(
        (skill) =>
          skill.name.toLowerCase() ===
          name.toLowerCase(),
      );

    if (existing) {
      setSelectedSkills(
        (current) =>
          current.includes(
            existing.id,
          )
            ? current
            : [
                ...current,
                existing.id,
              ],
      );

      setCustomSkillInput("");
      return;
    }

    const duplicate =
      customSkills.some(
        (skill) =>
          skill.toLowerCase() ===
          name.toLowerCase(),
      );

    if (!duplicate) {
      setCustomSkills(
        (current) => [
          ...current,
          name,
        ],
      );
    }

    setCustomSkillInput("");
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


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");


    if (
      role ===
        "VOLUNTEER" &&
      selectedSkills.length ===
        0 &&
      customSkills.length ===
        0
    ) {
      setError(
        "Please select or add at least one volunteer skill.",
      );

      return;
    }


    if (
      role ===
        "COORDINATOR" &&
      !coordinatorSpecialization.trim()
    ) {
      setError(
        "Please enter your coordinator specialization.",
      );

      return;
    }


    if (
      role ===
        "NGO_ADMIN" &&
      (
        !ngoName.trim() ||
        !ngoEmail.trim() ||
        !ngoRegistrationNumber.trim()
      )
    ) {
      setError(
        "Please complete the required NGO information.",
      );

      return;
    }


    try {
      setSubmitting(true);

      await registerAccount({
        username,
        email,
        password,

        first_name:
          firstName,

        last_name:
          lastName,

        phone,
        role,

        ...(role ===
        "VOLUNTEER"
          ? {
              skill_ids:
                selectedSkills,

              custom_skill_names:
                customSkills,

              availability_notes:
                availabilityNotes,
            }
          : {}),

        ...(role ===
        "COORDINATOR"
          ? {
              coordinator_specialization:
                coordinatorSpecialization,

              coordinator_experience:
                coordinatorExperience,
            }
          : {}),

        ...(role ===
        "DONOR"
          ? {
              donor_organization:
                donorOrganization,

              donor_preferred_causes:
                donorPreferredCauses,
            }
          : {}),

        ...(role ===
        "NGO_ADMIN"
          ? {
              ngo_name:
                ngoName,

              ngo_email:
                ngoEmail,

              ngo_address:
                ngoAddress,

              ngo_registration_number:
                ngoRegistrationNumber,
            }
          : {}),
      });


      navigate(
        "/login",
        {
          replace: true,

          state: {
            accountCreated:
              true,
          },
        },
      );

    } catch (err: unknown) {
      console.error(
        "Registration failed:",
        err,
      );

      if (
        typeof err ===
          "object" &&
        err !== null &&
        "response" in err
      ) {
        const response = (
          err as {
            response?: {
              data?: Record<
                string,
                unknown
              >;
            };
          }
        ).response;

        const data =
          response?.data;

        if (data) {
          const firstError =
            Object.values(
              data,
            )[0];

          if (
            Array.isArray(
              firstError,
            ) &&
            firstError.length >
              0
          ) {
            setError(
              String(
                firstError[0],
              ),
            );

            return;
          }

          if (
            typeof firstError ===
            "string"
          ) {
            setError(
              firstError,
            );

            return;
          }
        }
      }

      setError(
        "Unable to create account. Please check your information and try again.",
      );

    } finally {
      setSubmitting(false);
    }
  }


  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3 text-slate-800 placeholder:text-slate-400";


  return (
    <div className="min-h-screen bg-[#eaf0f5] lg:grid lg:grid-cols-[0.75fr_1.25fr]">


      {/* Left panel */}

      <div className="relative hidden overflow-hidden bg-[#172033] p-12 text-white lg:flex lg:flex-col lg:justify-between">

        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl" />


        <div className="relative flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-xl font-bold">
            N
          </div>

          <div>
            <p className="font-bold">
              NGO Volunteer Coordination
            </p>

            <p className="text-xs text-slate-400">
              Volunteer Management Platform
            </p>
          </div>

        </div>


        <div className="relative max-w-lg">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Join the community
          </p>

          <h1 className="mt-5 text-5xl font-bold tracking-tight">
            Create an account built around your role.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Volunteer, coordinate events,
            manage an NGO, or support
            organizations through donations.
          </p>

        </div>


        <p className="relative text-xs text-slate-500">
          NGO Volunteer Coordination Platform
        </p>

      </div>


      {/* Form */}

      <div className="px-5 py-10 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-3xl">


          {/* Mobile brand */}

          <div className="mb-8 flex items-center gap-3 lg:hidden">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white">
              N
            </div>

            <div>
              <p className="font-bold text-slate-900">
                NGO Volunteer Coordination
              </p>

              <p className="text-xs text-slate-500">
                Volunteer Management Platform
              </p>
            </div>

          </div>


          <div>

            <p className="text-sm font-semibold text-blue-600">
              Get started
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Choose your role and enter
              the information required for
              your workspace.
            </p>

          </div>


          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-100/60 p-4 text-sm text-red-700">
              {error}
            </div>
          )}


          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7 space-y-6"
          >


            {/* Role */}

            <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Account Type
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                How will you use the platform?
              </h2>


              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {roleOptions.map(
                  (option) => {

                    const selected =
                      role ===
                      option.value;

                    return (
                      <button
                        type="button"
                        key={
                          option.value
                        }
                        onClick={() =>
                          setRole(
                            option.value,
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-400 bg-blue-100/70 ring-2 ring-blue-200"
                            : "border-slate-300 bg-[#eaf0f5] hover:border-blue-300"
                        }`}
                      >

                        <p className={`font-bold ${
                          selected
                            ? "text-blue-800"
                            : "text-slate-800"
                        }`}>
                          {
                            option.title
                          }
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {
                            option.description
                          }
                        </p>

                      </button>
                    );
                  },
                )}

              </div>

            </section>


            {/* Basic account */}

            <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                Account
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Basic Information
              </h2>


              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    First Name
                  </label>

                  <input
                    value={
                      firstName
                    }
                    onChange={(
                      event,
                    ) =>
                      setFirstName(
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
                    Last Name
                  </label>

                  <input
                    value={
                      lastName
                    }
                    onChange={(
                      event,
                    ) =>
                      setLastName(
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
                    Username
                  </label>

                  <input
                    value={
                      username
                    }
                    onChange={(
                      event,
                    ) =>
                      setUsername(
                        event
                          .target
                          .value,
                      )
                    }
                    autoComplete="username"
                    required
                    className={
                      inputClass
                    }
                  />
                </div>


                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event
                          .target
                          .value,
                      )
                    }
                    autoComplete="email"
                    required
                    className={
                      inputClass
                    }
                  />
                </div>


                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={
                      phone
                    }
                    onChange={(
                      event,
                    ) =>
                      setPhone(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="+8801XXXXXXXXX"
                    className={
                      inputClass
                    }
                  />
                </div>


                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event
                          .target
                          .value,
                      )
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className={
                      inputClass
                    }
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Minimum 8 characters.
                  </p>
                </div>

              </div>

            </section>


            {/* Volunteer */}

            {role ===
              "VOLUNTEER" && (

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Volunteer
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Skills & Availability
                </h2>


                <div className="mt-5">

                  <p className="text-sm font-semibold text-slate-700">
                    Select Skills
                  </p>


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
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
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

                </div>


                <div className="mt-6 border-t border-slate-300/60 pt-5">

                  <label className="text-sm font-semibold text-slate-700">
                    Add Your Own Skill
                  </label>

                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">

                    <input
                      value={
                        customSkillInput
                      }
                      onChange={(
                        event,
                      ) =>
                        setCustomSkillInput(
                          event
                            .target
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
                      className={`${inputClass} mt-0 flex-1`}
                    />

                    <button
                      type="button"
                      onClick={
                        addCustomSkill
                      }
                      className="rounded-xl bg-[#263449] px-5 py-3 font-semibold text-white"
                    >
                      Add Skill
                    </button>

                  </div>


                  {customSkills.length >
                    0 && (

                    <div className="mt-4 flex flex-wrap gap-2">

                      {customSkills.map(
                        (skill) => (

                          <span
                            key={
                              skill
                            }
                            className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm text-blue-700"
                          >
                            {skill}

                            <button
                              type="button"
                              onClick={() =>
                                removeCustomSkill(
                                  skill,
                                )
                              }
                            >
                              ×
                            </button>
                          </span>

                        ),
                      )}

                    </div>

                  )}

                </div>


                <div className="mt-6">

                  <label className="text-sm font-semibold text-slate-700">
                    Availability Notes
                  </label>

                  <textarea
                    rows={4}
                    value={
                      availabilityNotes
                    }
                    onChange={(
                      event,
                    ) =>
                      setAvailabilityNotes(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Example: Available on weekends..."
                    className={
                      inputClass
                    }
                  />

                </div>

              </section>

            )}


            {/* Coordinator */}

            {role ===
              "COORDINATOR" && (

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Coordinator
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Coordinator Information
                </h2>


                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-700">
                    Specialization
                  </label>

                  <input
                    value={
                      coordinatorSpecialization
                    }
                    onChange={(
                      event,
                    ) =>
                      setCoordinatorSpecialization(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Example: Logistics and Event Operations"
                    className={
                      inputClass
                    }
                  />

                </div>


                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-700">
                    Experience Notes
                  </label>

                  <textarea
                    rows={4}
                    value={
                      coordinatorExperience
                    }
                    onChange={(
                      event,
                    ) =>
                      setCoordinatorExperience(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Tell NGOs about your experience..."
                    className={
                      inputClass
                    }
                  />

                </div>

              </section>

            )}


            {/* Donor */}

            {role ===
              "DONOR" && (

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                  Donor
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Donor Information
                </h2>


                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-700">
                    Organization / Company
                  </label>

                  <input
                    value={
                      donorOrganization
                    }
                    onChange={(
                      event,
                    ) =>
                      setDonorOrganization(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Optional"
                    className={
                      inputClass
                    }
                  />

                </div>


                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-700">
                    Preferred Causes
                  </label>

                  <textarea
                    rows={4}
                    value={
                      donorPreferredCauses
                    }
                    onChange={(
                      event,
                    ) =>
                      setDonorPreferredCauses(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Education, healthcare, disaster relief..."
                    className={
                      inputClass
                    }
                  />

                </div>

              </section>

            )}


            {/* NGO */}

            {role ===
              "NGO_ADMIN" && (

              <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                  Organization
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  NGO Information
                </h2>


                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      NGO Name
                    </label>

                    <input
                      value={
                        ngoName
                      }
                      onChange={(
                        event,
                      ) =>
                        setNgoName(
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
                      NGO Email
                    </label>

                    <input
                      type="email"
                      value={
                        ngoEmail
                      }
                      onChange={(
                        event,
                      ) =>
                        setNgoEmail(
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


                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Address
                    </label>

                    <textarea
                      rows={3}
                      value={
                        ngoAddress
                      }
                      onChange={(
                        event,
                      ) =>
                        setNgoAddress(
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>


                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Registration Number
                    </label>

                    <input
                      value={
                        ngoRegistrationNumber
                      }
                      onChange={(
                        event,
                      ) =>
                        setNgoRegistrationNumber(
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

                    <p className="mt-2 text-xs text-slate-500">
                      This will later be
                      checked against the
                      verified NGO registry.
                    </p>
                  </div>

                </div>

              </section>

            )}


            {/* Submit */}

            <div className="rounded-2xl border border-slate-300/60 bg-[#e3eaf1] p-5">

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting
                  ? "Creating Account..."
                  : "Create Account"}
              </button>


              <p className="mt-4 text-center text-sm text-slate-500">
                Already have an
                account?{" "}

                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Link>
              </p>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}