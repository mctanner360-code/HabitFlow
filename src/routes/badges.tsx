import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser } from "~/lib/auth-fns";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { getUserFromRequest } from "~/lib/auth";

const BADGE_DEFINITIONS: Record<number, { emoji: string; name: string; description: string }> = {
  3: { emoji: "🥉", name: "Bronze Starter", description: "3-day streak — you're on your way!" },
  7: { emoji: "🥈", name: "Silver Streaker", description: "7-day streak — a full week of consistency!" },
  14: { emoji: "🥇", name: "Gold Forger", description: "14-day streak — two weeks strong!" },
  21: { emoji: "🌟", name: "Habit Star", description: "21-day streak — habits are forming!" },
  30: { emoji: "🔥", name: "On Fire", description: "30-day streak — one month of dedication!" },
  60: { emoji: "💪", name: "Iron Will", description: "60-day streak — two months unstoppable!" },
  90: { emoji: "🏆", name: "Habit Champion", description: "90-day streak — a quarter year of excellence!" },
  365: { emoji: "👑", name: "Legend", description: "365-day streak — a full year! You're legendary!" },
};

const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 365];

export const getUserBadges = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Not authenticated");

  const db = sql();
  const badges = await db`
    SELECT b.*, h.name as habit_name, h.icon as habit_icon
    FROM badges b
    JOIN habits h ON h.id = b.habit_id
    WHERE b.user_id = ${user.userId}
    ORDER BY b.milestone ASC, b.achieved_at DESC;
  `;

  return badges.map((b: any) => ({
    id: b.id,
    habitId: b.habit_id,
    habitName: b.habit_name,
    habitIcon: b.habit_icon || "🎯",
    badgeType: b.badge_type,
    milestone: b.milestone,
    achievedAt: String(b.achieved_at),
    emoji: BADGE_DEFINITIONS[b.milestone]?.emoji || "🏅",
    name: BADGE_DEFINITIONS[b.milestone]?.name || "Unknown Badge",
    description: BADGE_DEFINITIONS[b.milestone]?.description || "",
  }));
});

export const Route = createFileRoute("/badges")({
  component: BadgesPage,
});

function BadgesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          navigate({ to: "/login" });
          return;
        }
        setUser(userData);
        const badgesData = await getUserBadges();
        setBadges(badgesData);
      } catch {
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Group badges by habit
  const badgesByHabit: Record<string, any[]> = {};
  for (const badge of badges) {
    const key = badge.habitId;
    if (!badgesByHabit[key]) {
      badgesByHabit[key] = [];
    }
    badgesByHabit[key].push(badge);
  }

  // Count earned badges
  const earnedCount = badges.length;
  const totalPossible = MILESTONES.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          🏆 Your Badges
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          You've earned {earnedCount} of {totalPossible} badge types.
        </p>
      </div>

      {/* All available badges */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Badge Collection
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MILESTONES.map((milestone) => {
            const def = BADGE_DEFINITIONS[milestone];
            const earned = badges.some((b) => b.milestone === milestone);
            return (
              <div
                key={milestone}
                className={`rounded-xl border p-6 text-center transition-all ${
                  earned
                    ? "border-indigo-200 bg-indigo-50 shadow-sm dark:border-indigo-800 dark:bg-indigo-950"
                    : "border-gray-200 bg-gray-50 opacity-50 dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                <div className="text-4xl">{earned ? def.emoji : "🔒"}</div>
                <h3 className={`mt-2 text-sm font-semibold ${
                  earned ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {def.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {earned ? def.description : `${milestone}-day streak`}
                </p>
                {earned && (
                  <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    Earned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges by habit */}
      {Object.keys(badgesByHabit).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Per Habit Breakdown
          </h2>
          <div className="space-y-4">
            {Object.entries(badgesByHabit).map(([habitId, habitBadges]) => {
              const habit = habitBadges[0];
              return (
                <div
                  key={habitId}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.habitIcon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {habit.habitName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {habitBadges.length} badge{habitBadges.length !== 1 ? "s" : ""} earned
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {habitBadges.map((badge: any) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm dark:bg-indigo-950"
                      >
                        <span>{badge.emoji}</span>
                        <span className="font-medium text-indigo-700 dark:text-indigo-300">
                          {badge.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {badge.milestone} days
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {badges.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-4xl">🏅</div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No badges yet
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Keep checking in to your habits to earn badges. Hit 3, 7, 14, 21, 30, 60, 90, and 365
            day streaks to collect them all!
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Go to dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}