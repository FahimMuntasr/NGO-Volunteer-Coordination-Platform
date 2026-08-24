import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getEvents,
} from "../../api/events";

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
  const [
    events,
    setEvents,
  ] =
    useState<Event[]>([]);

  const [
    selectedEventId,
    setSelectedEventId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    teams,
    setTeams,
  ] =
    useState<Team[]>([]);

  const [
    registrations,
    setRegistrations,
  ] =
    useState<
      EventRegistration[]
    >([]);

  const [
    teamName,
    setTeamName,
  ] =
    useState("");

  const [
    selectedVolunteer,
    setSelectedVolunteer,
  ] =
    useState<
      Record<
        number,
        number
      >
    >({});

  const [
    assignedTasks,
    setAssignedTasks,
  ] =
    useState<
      Record<
        number,
        string
      >
    >({});

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    working,
    setWorking,
  ] =
    useState(false);


  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data);

        if (
          data.length >
          0
        ) {
          setSelectedEventId(
            data[0].id,
          );
        }
      })
      .catch(() =>
        setError(
          "Unable to load assigned events.",
        ),
      )
      .finally(() =>
        setLoading(
          false,
        ),
      );
  }, []);


  useEffect(() => {
    if (
      !selectedEventId
    ) {
      return;
    }

    Promise.all([
      getEventTeams(
        selectedEventId,
      ),

      getEventRegistrations(
        selectedEventId,
      ),
    ])
      .then(
        ([
          teamData,
          registrationData,
        ]) => {
          setTeams(
            teamData,
          );

          setRegistrations(
            registrationData,
          );
        },
      )
      .catch(() =>
        setError(
          "Unable to load teams.",
        ),
      );

  }, [
    selectedEventId,
  ]);


  async function refreshTeams() {
    if (
      !selectedEventId
    ) {
      return;
    }

    setTeams(
      await getEventTeams(
        selectedEventId,
      ),
    );
  }


  async function handleCreateTeam(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !selectedEventId
    ) {
      return;
    }

    if (
      !teamName.trim()
    ) {
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

    } catch {
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
      selectedVolunteer[
        teamId
      ];

    if (
      !volunteerId
    ) {
      setError(
        "Select a volunteer first.",
      );

      return;
    }

    try {
      setWorking(true);
      setError("");

      await addTeamMember(
        teamId,
        volunteerId,
        assignedTasks[
          teamId
        ] ?? "",
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

    } catch {
      setError(
        "Unable to add volunteer. They may already be assigned to another team.",
      );

    } finally {
      setWorking(false);
    }
  }


  const approved =
    registrations.filter(
      (item) =>
        item.status ===
        "APPROVED",
    );


  const assignedIds =
    new Set(
      teams.flatMap(
        (team) =>
          team.memberships.map(
            (member) =>
              member.volunteer,
          ),
      ),
    );


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Team Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Teams
          </h1>

          <p className="mt-1 text-slate-500">
            Create teams and assign approved
            volunteers.
          </p>
        </div>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-emerald-100/60 p-4 text-emerald-700">
            ✓ {success}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading events...
          </div>

        ) : (

          <>


            <section className="rounded-2xl bg-[#f4f7fa] p-5">

              <label className="text-sm font-semibold text-slate-700">
                Select Event
              </label>

              <select
                value={
                  selectedEventId ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  setSelectedEventId(
                    Number(
                      event
                        .target
                        .value,
                    ),
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
              >
                {events.map(
                  (event) => (
                    <option
                      key={
                        event.id
                      }
                      value={
                        event.id
                      }
                    >
                      {
                        event.title
                      }
                      {" — "}
                      {
                        event.status
                      }
                    </option>
                  ),
                )}
              </select>

            </section>


            <form
              onSubmit={
                handleCreateTeam
              }
              className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
            >

              <h2 className="text-xl font-bold text-slate-900">
                Create Team
              </h2>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                <input
                  value={
                    teamName
                  }
                  onChange={(
                    event,
                  ) =>
                    setTeamName(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Example: Logistics Team"
                  className="flex-1 rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
                />

                <button
                  type="submit"
                  disabled={
                    working
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                  Create Team
                </button>

              </div>

            </form>


            <div className="grid gap-5 lg:grid-cols-2">

              {teams.map(
                (team) => (

                  <section
                    key={
                      team.id
                    }
                    className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6"
                  >

                    <div className="flex justify-between">

                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {
                            team.name
                          }
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            team.memberships.length
                          }{" "}
                          members
                        </p>
                      </div>

                    </div>


                    {team.memberships.length >
                      0 && (

                      <div className="mt-4 space-y-2">

                        {team.memberships.map(
                          (
                            member,
                          ) => (

                            <div
                              key={
                                member.id
                              }
                              className="rounded-xl bg-[#eaf0f5] p-3"
                            >
                              <p className="font-semibold text-slate-800">
                                {
                                  member.volunteer_username
                                }
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {member.assigned_task ||
                                  "No task assigned"}
                              </p>
                            </div>

                          ),
                        )}

                      </div>

                    )}


                    <div className="mt-5 border-t border-slate-300/60 pt-5">

                      <h3 className="font-bold text-slate-800">
                        Add Volunteer
                      </h3>


                      <select
                        value={
                          selectedVolunteer[
                            team.id
                          ] ?? ""
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedVolunteer(
                            (
                              current,
                            ) => ({
                              ...current,

                              [team.id]:
                                Number(
                                  event
                                    .target
                                    .value,
                                ),
                            }),
                          )
                        }
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
                      >
                        <option value="">
                          Select approved volunteer
                        </option>

                        {approved
                          .filter(
                            (
                              item,
                            ) =>
                              !assignedIds.has(
                                item.volunteer,
                              ),
                          )
                          .map(
                            (
                              registration,
                            ) => (

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
                        onChange={(
                          event,
                        ) =>
                          setAssignedTasks(
                            (
                              current,
                            ) => ({
                              ...current,

                              [team.id]:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        placeholder="Assigned task"
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
                      />


                      <button
                        type="button"
                        disabled={
                          working
                        }
                        onClick={() =>
                          handleAddMember(
                            team.id,
                          )
                        }
                        className="mt-3 rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white"
                      >
                        Add Member
                      </button>

                    </div>

                  </section>

                ),
              )}

            </div>


            {teams.length ===
              0 && (

              <div className="rounded-2xl bg-[#f4f7fa] p-8 text-center text-slate-500">
                No teams created yet.
              </div>

            )}

          </>

        )}

      </div>

    </DashboardLayout>
  );
}