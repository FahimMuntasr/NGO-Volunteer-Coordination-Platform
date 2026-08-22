import {
    useEffect,
    useState,
  } from "react";
  
  import DashboardLayout from "../../layouts/DashboardLayout";
  
  import { getEvents } from "../../api/events";
  
  import {
    getEventRegistrations,
  } from "../../api/eventManagement";
  
  import {
    addTeamMember,
    createTeam,
    getEventTeams,
    type Team,
  } from "../../api/coordinator";
  
  import type {
    Event,
    EventRegistration,
  } from "../../types/event";
  
  export default function CoordinatorTeams() {
    const [events, setEvents] =
      useState<Event[]>([]);
  
    const [selectedEventId, setSelectedEventId] =
      useState<number | null>(null);
  
    const [teams, setTeams] =
      useState<Team[]>([]);
  
    const [registrations, setRegistrations] =
      useState<EventRegistration[]>([]);
  
    const [teamName, setTeamName] =
      useState("");
  
    const [selectedVolunteer, setSelectedVolunteer] =
      useState<Record<number, number>>({});
  
    const [assignedTasks, setAssignedTasks] =
      useState<Record<number, string>>({});
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [success, setSuccess] =
      useState("");
  
    const [working, setWorking] =
      useState(false);
  
    useEffect(() => {
      let cancelled = false;
  
      getEvents()
        .then((data) => {
          if (cancelled) {
            return;
          }
  
          setEvents(data);
  
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
          }
        })
        .catch((err) => {
          if (cancelled) {
            return;
          }
  
          console.error(err);
  
          setError(
            "Unable to load assigned events.",
          );
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
  
      return () => {
        cancelled = true;
      };
    }, []);
  
    useEffect(() => {
      if (!selectedEventId) {
        return;
      }
  
      let cancelled = false;
  
      Promise.all([
        getEventTeams(selectedEventId),
        getEventRegistrations(
          selectedEventId,
        ),
      ])
        .then(
          ([
            teamsData,
            registrationsData,
          ]) => {
            if (cancelled) {
              return;
            }
  
            setTeams(teamsData);
            setRegistrations(
              registrationsData,
            );
            setError("");
          },
        )
        .catch((err) => {
          if (cancelled) {
            return;
          }
  
          console.error(err);
  
          setError(
            "Unable to load teams.",
          );
        });
  
      return () => {
        cancelled = true;
      };
    }, [selectedEventId]);
  
    async function refreshTeams() {
      if (!selectedEventId) {
        return;
      }
  
      const data =
        await getEventTeams(
          selectedEventId,
        );
  
      setTeams(data);
    }
  
    async function handleCreateTeam(
      event: React.FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      if (!selectedEventId) {
        return;
      }
  
      if (!teamName.trim()) {
        setError(
          "Enter a team name.",
        );
        return;
      }
  
      try {
        setWorking(true);
        setError("");
        setSuccess("");
  
        await createTeam(
          selectedEventId,
          teamName.trim(),
        );
  
        setTeamName("");
  
        await refreshTeams();
  
        setSuccess(
          "Team created successfully.",
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to create team.",
        );
      } finally {
        setWorking(false);
      }
    }
  
    async function handleAddMember(
      teamId: number,
    ) {
      const volunteerId =
        selectedVolunteer[teamId];
  
      if (!volunteerId) {
        setError(
          "Select a volunteer first.",
        );
        return;
      }
  
      try {
        setWorking(true);
        setError("");
        setSuccess("");
  
        await addTeamMember(
          teamId,
          volunteerId,
          assignedTasks[teamId] ?? "",
        );
  
        await refreshTeams();
  
        setSelectedVolunteer(
          (current) => ({
            ...current,
            [teamId]: 0,
          }),
        );
  
        setAssignedTasks(
          (current) => ({
            ...current,
            [teamId]: "",
          }),
        );
  
        setSuccess(
          "Volunteer added to team.",
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to add volunteer. They may already be assigned to another team.",
        );
      } finally {
        setWorking(false);
      }
    }
  
    const approvedRegistrations =
      registrations.filter(
        (registration) =>
          registration.status ===
          "APPROVED",
      );
  
    const assignedVolunteerIds =
      new Set(
        teams.flatMap((team) =>
          team.memberships.map(
            (membership) =>
              membership.volunteer,
          ),
        ),
      );
  
    return (
      <DashboardLayout>
        <div className="space-y-6">
  
          <div>
            <h1 className="text-3xl font-bold">
              Teams
            </h1>
  
            <p className="mt-1 text-gray-600">
              Create teams and assign approved
              volunteers.
            </p>
          </div>
  
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
  
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}
  
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <>
              <div className="rounded-xl bg-white p-5 shadow">
                <label className="font-medium">
                  Select Event
                </label>
  
                <select
                  value={
                    selectedEventId ?? ""
                  }
                  onChange={(event) =>
                    setSelectedEventId(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="mt-2 w-full rounded-lg border p-3"
                >
                  {events.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.title}
                      {" — "}
                      {event.status}
                    </option>
                  ))}
                </select>
              </div>
  
              <form
                onSubmit={handleCreateTeam}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h2 className="text-xl font-semibold">
                  Create Team
                </h2>
  
                <div className="mt-4 flex flex-col gap-3 md:flex-row">
  
                  <input
                    value={teamName}
                    onChange={(event) =>
                      setTeamName(
                        event.target.value,
                      )
                    }
                    placeholder="Example: Logistics Team"
                    className="flex-1 rounded-lg border p-3"
                  />
  
                  <button
                    disabled={working}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                  >
                    Create Team
                  </button>
  
                </div>
              </form>
  
              <div className="space-y-4">
  
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-xl bg-white p-6 shadow"
                  >
                    <h2 className="text-xl font-semibold">
                      {team.name}
                    </h2>
  
                    <p className="mt-1 text-gray-500">
                      Members:{" "}
                      {team.memberships.length}
                    </p>
  
                    {team.memberships.length >
                      0 && (
                      <div className="mt-4 space-y-2">
  
                        {team.memberships.map(
                          (member) => (
                            <div
                              key={member.id}
                              className="rounded-lg bg-gray-50 p-3"
                            >
                              <p className="font-medium">
                                {
                                  member.volunteer_username
                                }
                              </p>
  
                              <p className="text-sm text-gray-500">
                                Task:{" "}
                                {member.assigned_task ||
                                  "No task assigned"}
                              </p>
                            </div>
                          ),
                        )}
  
                      </div>
                    )}
  
                    <div className="mt-5 border-t pt-5">
  
                      <h3 className="font-medium">
                        Add Volunteer
                      </h3>
  
                      <select
                        value={
                          selectedVolunteer[
                            team.id
                          ] ?? ""
                        }
                        onChange={(event) =>
                          setSelectedVolunteer(
                            (current) => ({
                              ...current,
                              [team.id]:
                                Number(
                                  event.target
                                    .value,
                                ),
                            }),
                          )
                        }
                        className="mt-2 w-full rounded-lg border p-3"
                      >
                        <option value="">
                          Select approved volunteer
                        </option>
  
                        {approvedRegistrations
                          .filter(
                            (registration) =>
                              !assignedVolunteerIds.has(
                                registration.volunteer,
                              ),
                          )
                          .map(
                            (registration) => (
                              <option
                                key={
                                  registration.id
                                }
                                value={
                                  registration.volunteer
                                }
                              >
                                {
                                  registration.volunteer_username
                                }
                              </option>
                            ),
                          )}
  
                      </select>
  
                      <input
                        value={
                          assignedTasks[
                            team.id
                          ] ?? ""
                        }
                        onChange={(event) =>
                          setAssignedTasks(
                            (current) => ({
                              ...current,
                              [team.id]:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        placeholder="Assigned task"
                        className="mt-3 w-full rounded-lg border p-3"
                      />
  
                      <button
                        type="button"
                        disabled={working}
                        onClick={() =>
                          handleAddMember(
                            team.id,
                          )
                        }
                        className="mt-3 rounded-lg bg-green-600 px-5 py-2 text-white"
                      >
                        Add Member
                      </button>
  
                    </div>
                  </div>
                ))}
  
                {teams.length === 0 && (
                  <div className="rounded-xl bg-white p-6 shadow">
                    No teams created yet.
                  </div>
                )}
  
              </div>
            </>
          )}
  
        </div>
      </DashboardLayout>
    );
  }