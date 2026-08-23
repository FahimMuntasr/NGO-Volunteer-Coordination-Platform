import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getVolunteerRankings,
  type RankedVolunteer,
  type RankingStrategy,
} from "../../api/rankings";

const strategyDescriptions: Record<
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

export default function VolunteerRankings() {
  const [strategy, setStrategy] =
    useState<RankingStrategy>("overall");

  const [rankings, setRankings] =
    useState<RankedVolunteer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadRankings() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getVolunteerRankings(
            strategy,
          );

        setRankings(data);
      } catch {
        setError(
          "Failed to load volunteer rankings.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRankings();
  }, [strategy]);

  function getRankDisplay(
    position: number,
  ) {
    if (position === 1) {
      return "🥇";
    }

    if (position === 2) {
      return "🥈";
    }

    if (position === 3) {
      return "🥉";
    }

    return `#${position}`;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Volunteer Rankings
          </h1>

          <p className="mt-1 text-gray-600">
            Compare volunteers using different
            ranking strategies.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <label
                htmlFor="ranking-strategy"
                className="block text-sm font-medium text-gray-700"
              >
                Ranking Strategy
              </label>

              <select
                id="ranking-strategy"
                value={strategy}
                onChange={(event) =>
                  setStrategy(
                    event.target
                      .value as RankingStrategy,
                  )
                }
                className="mt-2 min-w-64 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800 md:max-w-md">
              {
                strategyDescriptions[
                  strategy
                ]
              }
            </div>

          </div>

        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-gray-500">
              Loading rankings...
            </p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <div className="text-4xl">
              🏆
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              No volunteers available
            </h2>

            <p className="mt-2 text-gray-500">
              Volunteer rankings will appear
              once profiles exist.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">

              {rankings
                .slice(0, 3)
                .map((volunteer) => (
                  <div
                    key={`${volunteer.position}-${volunteer.name}`}
                    className="rounded-xl bg-white p-6 text-center shadow"
                  >
                    <div className="text-4xl">
                      {getRankDisplay(
                        volunteer.position,
                      )}
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-gray-900">
                      {volunteer.name}
                    </h2>

                    <p className="mt-2 text-3xl font-bold text-blue-600">
                      {volunteer.score}
                    </p>

                    <p className="text-sm text-gray-500">
                      Ranking Score
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-sm">

                      <div>
                        <p className="font-semibold">
                          {volunteer.skills}
                        </p>
                        <p className="text-gray-500">
                          Skills
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold">
                          {
                            volunteer.completed_events
                          }
                        </p>
                        <p className="text-gray-500">
                          Events
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold">
                          {
                            volunteer.total_hours
                          }
                        </p>
                        <p className="text-gray-500">
                          Hours
                        </p>
                      </div>

                    </div>
                  </div>
                ))}

            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow">

              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold">
                  Full Ranking
                </h2>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-gray-50 text-sm text-gray-600">
                    <tr>
                      <th className="px-6 py-4">
                        Rank
                      </th>
                      <th className="px-6 py-4">
                        Volunteer
                      </th>
                      <th className="px-6 py-4">
                        Skills
                      </th>
                      <th className="px-6 py-4">
                        Events
                      </th>
                      <th className="px-6 py-4">
                        Hours
                      </th>
                      <th className="px-6 py-4">
                        Score
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">

                    {rankings.map(
                      (volunteer) => (
                        <tr
                          key={`${volunteer.position}-${volunteer.name}`}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-lg font-semibold">
                            {getRankDisplay(
                              volunteer.position,
                            )}
                          </td>

                          <td className="px-6 py-4 font-medium text-gray-900">
                            {volunteer.name}
                          </td>

                          <td className="px-6 py-4">
                            {volunteer.skills}
                          </td>

                          <td className="px-6 py-4">
                            {
                              volunteer.completed_events
                            }
                          </td>

                          <td className="px-6 py-4">
                            {
                              volunteer.total_hours
                            }
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                              {volunteer.score}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}

                  </tbody>
                </table>

              </div>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}