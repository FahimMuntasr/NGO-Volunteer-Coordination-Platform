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
    const navigate = useNavigate();
  
    const [skills, setSkills] =
      useState<Skill[]>([]);
  
    const [selectedSkills, setSelectedSkills] =
      useState<number[]>([]);
  
    const [title, setTitle] = useState("");
    const [description, setDescription] =
      useState("");
    const [location, setLocation] =
      useState("");
    const [startDate, setStartDate] =
      useState("");
    const [endDate, setEndDate] =
      useState("");
    const [
      registrationDeadline,
      setRegistrationDeadline,
    ] = useState("");
  
    const [capacity, setCapacity] =
      useState(1);
  
    const [error, setError] =
      useState("");
  
    const [submitting, setSubmitting] =
      useState(false);
  
    useEffect(() => {
      getAvailableSkills()
        .then(setSkills)
        .catch(console.error);
    }, []);
  
    async function handleSubmit(
      event: React.FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      try {
        setSubmitting(true);
        setError("");
  
        await createEvent({
          title,
          description,
          location,
          start_date: startDate,
          end_date: endDate,
          registration_deadline:
            registrationDeadline,
          volunteer_capacity: capacity,
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
  
    function toggleSkill(skillId: number) {
      setSelectedSkills((current) =>
        current.includes(skillId)
          ? current.filter(
              (id) => id !== skillId,
            )
          : [...current, skillId],
      );
    }
  
    return (
      <DashboardLayout>
        <div className="max-w-3xl">
  
          <h1 className="text-3xl font-bold">
            Create Event
          </h1>
  
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow"
          >
  
            <input
              placeholder="Event title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
              className="w-full rounded border p-3"
            />
  
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
              className="w-full rounded border p-3"
            />
  
            <input
              placeholder="Location"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              required
              className="w-full rounded border p-3"
            />
  
            <div>
              <label>
                Registration Deadline
              </label>
  
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) =>
                  setRegistrationDeadline(
                    e.target.value,
                  )
                }
                required
                className="mt-1 w-full rounded border p-3"
              />
            </div>
  
            <div>
              <label>Start Date</label>
  
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                required
                className="mt-1 w-full rounded border p-3"
              />
            </div>
  
            <div>
              <label>End Date</label>
  
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                required
                className="mt-1 w-full rounded border p-3"
              />
            </div>
  
            <div>
              <label>
                Volunteer Capacity
              </label>
  
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) =>
                  setCapacity(
                    Number(e.target.value),
                  )
                }
                required
                className="mt-1 w-full rounded border p-3"
              />
            </div>
  
            <div>
              <p className="font-medium">
                Required Skills
              </p>
  
              <div className="mt-2 space-y-2">
  
                {skills.map((skill) => (
                  <label
                    key={skill.id}
                    className="block"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedSkills.includes(
                          skill.id,
                        )
                      }
                      onChange={() =>
                        toggleSkill(skill.id)
                      }
                    />
  
                    <span className="ml-2">
                      {skill.name}
                    </span>
                  </label>
                ))}
  
              </div>
            </div>
  
            {error && (
              <div className="rounded bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
  
            <button
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white"
            >
              {submitting
                ? "Creating..."
                : "Create Event"}
            </button>
  
          </form>
        </div>
      </DashboardLayout>
    );
  }