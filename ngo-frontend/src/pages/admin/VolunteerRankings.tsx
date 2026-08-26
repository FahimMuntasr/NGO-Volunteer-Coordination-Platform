import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getVolunteerRankings,
  type RankedVolunteer,
  type RankingStrategy,
} from "../../api/rankings";


const strategyDescriptions:
Record<
  RankingStrategy,
  string
> = {
  overall:
    "Balances completed events, volunteer hours, and skills.",

  skill:
    "Prioritizes volunteers with more registered skills.",

  experience:
    "Prioritizes volunteers with more completed events.",

  hours:
    "Rewards volunteers with the highest contribution hours.",

  beginner:
    "Gives additional priority to newer volunteers.",

  consistency:
    "Rewards volunteers who consistently contribute across events.",
};


function rankDisplay(
  position: number,
) {
  if (
    position === 1
  ) {
    return "🥇";
  }

  if (
    position === 2
  ) {
    return "🥈";
  }

  if (
    position === 3
  ) {
    return "🥉";
  }

  return `#${position}`;
}


export default function VolunteerRankings() {
  const [
    strategy,
    setStrategy,
  ] =
    useState<RankingStrategy>(
      "overall",
    );

  const [
    rankings,
    setRankings,
  ] =
    useState<
      RankedVolunteer[]
    >([]);

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


  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        setRankings(
          await getVolunteerRankings(
            strategy,
          ),
        );

      } catch {
        setError(
          "Failed to load volunteer rankings.",
        );

      } finally {
        setLoading(false);
      }
    }

    load();

  }, [
    strategy,
  ]);


  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Strategy Pattern
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Volunteer Rankings
          </h1>

          <p className="mt-1 text-slate-500">
            Compare volunteers using
            different ranking strategies.
          </p>
        </div>


        <section className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6">

          <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Ranking Strategy
              </label>

              <select
                value={
                  strategy
                }
                onChange={(
                  event,
                ) =>
                  setStrategy(
                    event
                      .target
                      .value as RankingStrategy,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#eef3f7] p-3"
              >
                <option value="overall">
                  Overall Rating
                </option>

                <option value="skill">
                  Skill Ranking
                </option>

                <option value="experience">
                  Experience Ranking
                </option>

                <option value="hours">
                  Hours Ranking
                </option>

                <option value="beginner">
                  Beginner Ranking
                </option>

                <option value="consistency">
                  Consistency Ranking
                </option>
              </select>
            </div>


            <div className="rounded-xl bg-blue-100/60 p-4 text-sm leading-6 text-blue-800">
              {
                strategyDescriptions[
                  strategy
                ]
              }
            </div>

          </div>

        </section>


        {error && (
          <div className="rounded-2xl bg-red-100/60 p-4 text-red-700">
            {error}
          </div>
        )}


        {loading ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-8 text-slate-500">
            Loading rankings...
          </div>

        ) : rankings.length ===
          0 ? (

          <div className="rounded-2xl bg-[#f4f7fa] p-10 text-center text-slate-500">
            No volunteers available.
          </div>

        ) : (

          <>


            <div className="grid gap-4 md:grid-cols-3">

              {rankings
                .slice(
                  0,
                  3,
                )
                .map(
                  (
                    volunteer,
                  ) => (

                    <article
                      key={`${volunteer.position}-${volunteer.name}`}
                      className="rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 text-center"
                    >

                      <div className="text-4xl">
                        {rankDisplay(
                          volunteer.position,
                        )}
                      </div>

                      <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {
                          volunteer.name
                        }
                      </h2>

                      <p className="mt-2 text-3xl font-bold text-blue-600">
                        {
                          volunteer.score
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        Ranking Score
                      </p>


                      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-300/60 pt-4 text-sm">

                        <div>
                          <p className="font-bold">
                            {
                              volunteer.skills
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            Skills
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">
                            {
                              volunteer.completed_events
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            Events
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">
                            {
                              volunteer.total_hours
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            Hours
                          </p>
                        </div>

                      </div>

                    </article>

                  ),
                )}

            </div>


            <section className="overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f4f7fa]">

              <div className="border-b border-slate-300/60 p-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Full Ranking
                </h2>
              </div>


              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="bg-[#e3eaf1] text-slate-600">
                    <tr>
                      <th className="px-5 py-4">
                        Rank
                      </th>

                      <th className="px-5 py-4">
                        Volunteer
                      </th>

                      <th className="px-5 py-4">
                        Skills
                      </th>

                      <th className="px-5 py-4">
                        Events
                      </th>

                      <th className="px-5 py-4">
                        Hours
                      </th>

                      <th className="px-5 py-4">
                        Score
                      </th>
                    </tr>
                  </thead>


                  <tbody className="divide-y divide-slate-300/50">

                    {rankings.map(
                      (
                        volunteer,
                      ) => (

                        <tr
                          key={`${volunteer.position}-${volunteer.name}`}
                          className="hover:bg-[#eaf0f5]"
                        >

                          <td className="px-5 py-4 font-bold">
                            {rankDisplay(
                              volunteer.position,
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {
                              volunteer.name
                            }
                          </td>

                          <td className="px-5 py-4">
                            {
                              volunteer.skills
                            }
                          </td>

                          <td className="px-5 py-4">
                            {
                              volunteer.completed_events
                            }
                          </td>

                          <td className="px-5 py-4">
                            {
                              volunteer.total_hours
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700">
                              {
                                volunteer.score
                              }
                            </span>
                          </td>

                        </tr>

                      ),
                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </>

        )}

      </div>

    </DashboardLayout>
  );
}