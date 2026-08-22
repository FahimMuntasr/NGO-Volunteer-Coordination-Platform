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
  
  export default function Register() {
    const navigate = useNavigate();
  
    // =========================================
    // COMMON ACCOUNT INFORMATION
    // =========================================
  
    const [username, setUsername] =
      useState("");
  
    const [email, setEmail] =
      useState("");
  
    const [password, setPassword] =
      useState("");
  
    const [firstName, setFirstName] =
      useState("");
  
    const [lastName, setLastName] =
      useState("");
  
    const [phone, setPhone] =
      useState("");
  
    const [role, setRole] =
      useState<UserRole>("VOLUNTEER");
  
    // =========================================
    // VOLUNTEER INFORMATION
    // =========================================
  
    const [skills, setSkills] =
      useState<Skill[]>([]);
  
    const [
      selectedSkills,
      setSelectedSkills,
    ] = useState<number[]>([]);
  
    const [
      customSkillInput,
      setCustomSkillInput,
    ] = useState("");
  
    const [
      customSkills,
      setCustomSkills,
    ] = useState<string[]>([]);
  
    const [
      availabilityNotes,
      setAvailabilityNotes,
    ] = useState("");
  
    // =========================================
    // COORDINATOR INFORMATION
    // =========================================
  
    const [
      coordinatorSpecialization,
      setCoordinatorSpecialization,
    ] = useState("");
  
    const [
      coordinatorExperience,
      setCoordinatorExperience,
    ] = useState("");
  
    // =========================================
    // DONOR INFORMATION
    // =========================================
  
    const [
      donorOrganization,
      setDonorOrganization,
    ] = useState("");
  
    const [
      donorPreferredCauses,
      setDonorPreferredCauses,
    ] = useState("");
  
    // =========================================
    // NGO ADMIN INFORMATION
    // =========================================
  
    const [ngoName, setNgoName] =
      useState("");
  
    const [ngoEmail, setNgoEmail] =
      useState("");
  
    const [ngoAddress, setNgoAddress] =
      useState("");
  
    const [
      ngoRegistrationNumber,
      setNgoRegistrationNumber,
    ] = useState("");
  
    // =========================================
    // PAGE STATE
    // =========================================
  
    const [error, setError] =
      useState("");
  
    const [submitting, setSubmitting] =
      useState(false);
  
    // =========================================
    // LOAD AVAILABLE SKILLS
    // =========================================
  
    useEffect(() => {
      let cancelled = false;
  
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
  
    // =========================================
    // SELECT EXISTING SKILL
    // =========================================
  
    function toggleSkill(
      skillId: number,
    ) {
      setSelectedSkills(
        (current) =>
          current.includes(skillId)
            ? current.filter(
                (id) =>
                  id !== skillId,
              )
            : [
                ...current,
                skillId,
              ],
      );
    }
  
    // =========================================
    // ADD CUSTOM SKILL
    // =========================================
  
    function addCustomSkill() {
      const newSkill =
        customSkillInput.trim();
  
      if (!newSkill) {
        return;
      }
  
      const alreadyAdded =
        customSkills.some(
          (skill) =>
            skill.toLowerCase() ===
            newSkill.toLowerCase(),
        );
  
      if (alreadyAdded) {
        setCustomSkillInput("");
        return;
      }
  
      setCustomSkills(
        (current) => [
          ...current,
          newSkill,
        ],
      );
  
      setCustomSkillInput("");
    }
  
    // =========================================
    // REMOVE CUSTOM SKILL
    // =========================================
  
    function removeCustomSkill(
      skillToRemove: string,
    ) {
      setCustomSkills(
        (current) =>
          current.filter(
            (skill) =>
              skill !==
              skillToRemove,
          ),
      );
    }
  
    // =========================================
    // CREATE ACCOUNT
    // =========================================
  
    async function handleSubmit(
      event: React.FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      setError("");
  
      // Volunteer must have at least one skill.
      if (
        role === "VOLUNTEER" &&
        selectedSkills.length === 0 &&
        customSkills.length === 0
      ) {
        setError(
          "Please select or add at least one volunteer skill.",
        );
  
        return;
      }
  
      // Coordinator needs a specialization.
      if (
        role === "COORDINATOR" &&
        !coordinatorSpecialization.trim()
      ) {
        setError(
          "Please enter your coordinator specialization.",
        );
  
        return;
      }
  
      // NGO Admin needs NGO information.
      if (
        role === "NGO_ADMIN" &&
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
          // Common information
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
  
          // Volunteer
          ...(role === "VOLUNTEER"
            ? {
                skill_ids:
                  selectedSkills,
  
                custom_skill_names:
                  customSkills,
  
                availability_notes:
                  availabilityNotes,
              }
            : {}),
  
          // Coordinator
          ...(role === "COORDINATOR"
            ? {
                coordinator_specialization:
                  coordinatorSpecialization,
  
                coordinator_experience:
                  coordinatorExperience,
              }
            : {}),
  
          // Donor
          ...(role === "DONOR"
            ? {
                donor_organization:
                  donorOrganization,
  
                donor_preferred_causes:
                  donorPreferredCauses,
              }
            : {}),
  
          // NGO Admin
          ...(role === "NGO_ADMIN"
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
              accountCreated: true,
            },
          },
        );
      } catch (err: unknown) {
        console.error(
          "Registration failed:",
          err,
        );
  
        if (
          typeof err === "object" &&
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
              firstError.length > 0
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
  
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
  
        <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
  
          {/* =====================================
              HEADER
          ====================================== */}
  
          <div className="mb-8 text-center">
  
            <h1 className="text-3xl font-bold text-gray-800">
              Create Account
            </h1>
  
            <p className="mt-2 text-gray-500">
              Join the NGO Volunteer Platform
            </p>
  
          </div>
  
          {/* =====================================
              ERROR
          ====================================== */}
  
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
  
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
  
            {/* =================================
                ACCOUNT TYPE
            ================================== */}
  
            <div>
              <label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Account Type
              </label>
  
              <select
                id="role"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target
                      .value as UserRole,
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="VOLUNTEER">
                  Volunteer
                </option>
  
                <option value="COORDINATOR">
                  Event Coordinator
                </option>
  
                <option value="DONOR">
                  Donor
                </option>
  
                <option value="NGO_ADMIN">
                  NGO Administrator
                </option>
              </select>
            </div>
  
            {/* =================================
                COMMON INFORMATION
            ================================== */}
  
            <div className="border-t pt-5">
  
              <h2 className="text-lg font-semibold text-gray-900">
                Account Information
              </h2>
  
              <p className="mt-1 text-sm text-gray-500">
                Enter your basic account
                information.
              </p>
  
            </div>
  
            {/* First + Last Name */}
  
            <div className="grid gap-4 md:grid-cols-2">
  
              <div>
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
  
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(
                      event.target.value,
                    )
                  }
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                />
              </div>
  
              <div>
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
  
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(
                      event.target.value,
                    )
                  }
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                />
              </div>
  
            </div>
  
            {/* Username */}
  
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </label>
  
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                autoComplete="username"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
  
            {/* Email */}
  
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
  
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                autoComplete="email"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
  
            {/* Phone */}
  
            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone
              </label>
  
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value,
                  )
                }
                placeholder="Example: +8801XXXXXXXXX"
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
  
            {/* Password */}
  
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
  
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                minLength={8}
                autoComplete="new-password"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              />
  
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters.
              </p>
            </div>
  
            {/* =================================
                VOLUNTEER
            ================================== */}
  
            {role === "VOLUNTEER" && (
              <div className="space-y-5 border-t pt-6">
  
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Volunteer Information
                  </h2>
  
                  <p className="mt-1 text-sm text-gray-500">
                    Tell NGOs about your
                    skills and availability.
                  </p>
                </div>
  
                {/* Existing Skills */}
  
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Existing Skills
                  </p>
  
                  {skills.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">
                      There are no existing
                      skills yet. Add your own
                      skill below.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
  
                      {skills.map(
                        (skill) => (
                          <label
                            key={skill.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedSkills.includes(
                                  skill.id,
                                )
                              }
                              onChange={() =>
                                toggleSkill(
                                  skill.id,
                                )
                              }
                            />
  
                            <span>
                              {skill.name}
                            </span>
  
                          </label>
                        ),
                      )}
  
                    </div>
                  )}
                </div>
  
                {/* Custom Skills */}
  
                <div>
                  <label
                    htmlFor="customSkill"
                    className="text-sm font-medium text-gray-700"
                  >
                    Add Your Own Skill
                  </label>
  
                  <div className="mt-2 flex gap-2">
  
                    <input
                      id="customSkill"
                      type="text"
                      value={
                        customSkillInput
                      }
                      onChange={(event) =>
                        setCustomSkillInput(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Example: First Aid"
                      className="flex-1 rounded-lg border border-gray-300 p-3"
                    />
  
                    <button
                      type="button"
                      onClick={
                        addCustomSkill
                      }
                      className="rounded-lg bg-gray-800 px-5 py-3 text-white transition hover:bg-gray-700"
                    >
                      Add
                    </button>
  
                  </div>
  
                  <p className="mt-2 text-xs text-gray-500">
                    Add skills that are not
                    already listed above.
                  </p>
  
                  {/* Custom Skill Tags */}
  
                  {customSkills.length >
                    0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
  
                      {customSkills.map(
                        (skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-sm text-blue-800"
                          >
                            <span>
                              {skill}
                            </span>
  
                            <button
                              type="button"
                              onClick={() =>
                                removeCustomSkill(
                                  skill,
                                )
                              }
                              className="font-bold text-blue-800"
                            >
                              ×
                            </button>
  
                          </div>
                        ),
                      )}
  
                    </div>
                  )}
                </div>
  
                <p className="text-xs text-gray-500">
                  Select an existing skill or
                  add at least one custom skill.
                </p>
  
                {/* Availability */}
  
                <div>
                  <label
                    htmlFor="availability"
                    className="text-sm font-medium text-gray-700"
                  >
                    Availability
                  </label>
  
                  <textarea
                    id="availability"
                    value={
                      availabilityNotes
                    }
                    onChange={(event) =>
                      setAvailabilityNotes(
                        event.target.value,
                      )
                    }
                    placeholder="Example: Available weekends and Friday evenings"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
              </div>
            )}
  
            {/* =================================
                COORDINATOR
            ================================== */}
  
            {role === "COORDINATOR" && (
              <div className="space-y-5 border-t pt-6">
  
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Coordinator Information
                  </h2>
  
                  <p className="mt-1 text-sm text-gray-500">
                    Tell NGOs about your
                    event coordination
                    experience.
                  </p>
                </div>
  
                {/* Specialization */}
  
                <div>
                  <label
                    htmlFor="coordinatorSpecialization"
                    className="text-sm font-medium text-gray-700"
                  >
                    Specialization
                  </label>
  
                  <input
                    id="coordinatorSpecialization"
                    type="text"
                    value={
                      coordinatorSpecialization
                    }
                    onChange={(event) =>
                      setCoordinatorSpecialization(
                        event.target.value,
                      )
                    }
                    placeholder="Example: Event logistics, volunteer management"
                    required={
                      role ===
                      "COORDINATOR"
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
                {/* Experience */}
  
                <div>
                  <label
                    htmlFor="coordinatorExperience"
                    className="text-sm font-medium text-gray-700"
                  >
                    Experience
                  </label>
  
                  <textarea
                    id="coordinatorExperience"
                    value={
                      coordinatorExperience
                    }
                    onChange={(event) =>
                      setCoordinatorExperience(
                        event.target.value,
                      )
                    }
                    placeholder="Briefly describe your event or volunteer coordination experience"
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
              </div>
            )}
  
            {/* =================================
                DONOR
            ================================== */}
  
            {role === "DONOR" && (
              <div className="space-y-5 border-t pt-6">
  
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Donor Information
                  </h2>
  
                  <p className="mt-1 text-sm text-gray-500">
                    Tell us about your
                    donation interests.
                  </p>
                </div>
  
                {/* Organization */}
  
                <div>
                  <label
                    htmlFor="donorOrganization"
                    className="text-sm font-medium text-gray-700"
                  >
                    Organization / Company
                  </label>
  
                  <input
                    id="donorOrganization"
                    type="text"
                    value={
                      donorOrganization
                    }
                    onChange={(event) =>
                      setDonorOrganization(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
                {/* Preferred Causes */}
  
                <div>
                  <label
                    htmlFor="donorCauses"
                    className="text-sm font-medium text-gray-700"
                  >
                    Preferred Causes
                  </label>
  
                  <textarea
                    id="donorCauses"
                    value={
                      donorPreferredCauses
                    }
                    onChange={(event) =>
                      setDonorPreferredCauses(
                        event.target.value,
                      )
                    }
                    placeholder="Example: Education, healthcare, disaster relief"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
              </div>
            )}
  
            {/* =================================
                NGO ADMIN
            ================================== */}
  
            {role === "NGO_ADMIN" && (
              <div className="space-y-5 border-t pt-6">
  
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    NGO Information
                  </h2>
  
                  <p className="mt-1 text-sm text-gray-500">
                    Your NGO must pass
                    verification before it can
                    create events.
                  </p>
                </div>
  
                {/* NGO Name */}
  
                <div>
                  <label
                    htmlFor="ngoName"
                    className="text-sm font-medium text-gray-700"
                  >
                    NGO Name
                  </label>
  
                  <input
                    id="ngoName"
                    type="text"
                    value={ngoName}
                    onChange={(event) =>
                      setNgoName(
                        event.target.value,
                      )
                    }
                    required={
                      role ===
                      "NGO_ADMIN"
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
                {/* NGO Email */}
  
                <div>
                  <label
                    htmlFor="ngoEmail"
                    className="text-sm font-medium text-gray-700"
                  >
                    NGO Email
                  </label>
  
                  <input
                    id="ngoEmail"
                    type="email"
                    value={ngoEmail}
                    onChange={(event) =>
                      setNgoEmail(
                        event.target.value,
                      )
                    }
                    required={
                      role ===
                      "NGO_ADMIN"
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
                {/* Registration Number */}
  
                <div>
                  <label
                    htmlFor="ngoRegistrationNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    NGO Registration Number
                  </label>
  
                  <input
                    id="ngoRegistrationNumber"
                    type="text"
                    value={
                      ngoRegistrationNumber
                    }
                    onChange={(event) =>
                      setNgoRegistrationNumber(
                        event.target.value,
                      )
                    }
                    required={
                      role ===
                      "NGO_ADMIN"
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
  
                  <p className="mt-1 text-xs text-gray-500">
                    This will be checked
                    against the verified NGO
                    registry.
                  </p>
                </div>
  
                {/* NGO Address */}
  
                <div>
                  <label
                    htmlFor="ngoAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    NGO Address
                  </label>
  
                  <textarea
                    id="ngoAddress"
                    value={ngoAddress}
                    onChange={(event) =>
                      setNgoAddress(
                        event.target.value,
                      )
                    }
                    placeholder="Enter the NGO's address"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
  
              </div>
            )}
  
            {/* =================================
                SUBMIT
            ================================== */}
  
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating Account..."
                : "Create Account"}
            </button>
  
          </form>
  
          {/* =====================================
              LOGIN LINK
          ====================================== */}
  
          <div className="mt-6 text-center text-sm text-gray-600">
  
            Already have an account?{" "}
  
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
  
          </div>
  
        </div>
      </div>
    );
  }