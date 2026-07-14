import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser } from "~/lib/auth-fns";
import { getHabits } from "~/lib/habits";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
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
        const habitsData = await getHabits();
        setHabits(habitsData);
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

  const totalCheckins = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const bestStreak = habits.reduce((best, h) => Math.max(best, h.longestStreak), 0);
  const avgStreak = habits.length > 0 ? Math.round(totalCheckins / habits.length) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          📊 Your Progress Reports
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          See how you're doing across all your habits.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Habits</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{habits.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{bestStreak} days</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Streak</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{avgStreak} days</p>
        </div>
      </div>

      {/* Habit Detail Reports */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Habit Breakdown
        </h2>

        {habits.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Create some habits first to see your reports.
            </p>
            <Link
              to="/habits/new"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Create your first habit →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {habits.map((habit) => {
              const streakPercent = habit.longestStreak > 0
                ? Math.min(100, Math.round((habit.currentStreak / habit.longestStreak) * 100))
                : 0;

              return (
                <div
                  key={habit.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon || "🎯"}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {habit.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {habit.frequency} &bull; {habit.currentStreak} day streak
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Longest: {habit.longestStreak} days
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Current streak</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {habit.currentStreak} / {habit.longestStreak || 1} days
                      </span>
                    </div>
                    <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${streakPercent}%`,
                          backgroundColor: habit.color || "#6366f1",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}