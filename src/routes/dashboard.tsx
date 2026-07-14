import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser } from "~/lib/auth-fns";
import { getHabits, checkInHabit, uncheckHabit } from "~/lib/habits";

const BADGE_EMOJIS: Record<number, string> = {
  3: "🥉",
  7: "🥈",
  14: "🥇",
  21: "🌟",
  30: "🔥",
  60: "💪",
  90: "🏆",
  365: "👑",
};

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, [navigate]);

  const handleCheckIn = async (habitId: string) => {
    setCheckingIn(habitId);
    try {
      await checkInHabit({ data: { habitId } });
      const habitsData = await getHabits();
      setHabits(habitsData);
    } catch (err) {
      console.error("Check-in failed", err);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleUncheck = async (habitId: string) => {
    setCheckingIn(habitId);
    try {
      await uncheckHabit({ data: habitId });
      const habitsData = await getHabits();
      setHabits(habitsData);
    } catch (err) {
      console.error("Uncheck failed", err);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate({ to: "/" });
    } catch {
      // ignore
    }
  };

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

  const totalStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const totalBadges = badges.length;
  const completedToday = habits.filter((h) => h.checkedInToday).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user.name}! 🔥
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {user.subscriptionStatus === "trial"
              ? `Your free trial ends on ${new Date(user.trialEnd).toLocaleDateString()}`
              : "Active subscriber"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            📊 Reports
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard icon="🔥" title="Best streak" value={`${totalStreak} days`} />
        <StatCard icon="🏆" title="Badges earned" value={`${totalBadges}`} />
        <StatCard
          icon="📊"
          title="Today's progress"
          value={`${completedToday}/${habits.length}`}
        />
      </div>

      {/* Habits Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Habits</h2>
          <Link
            to="/habits/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            + New Habit
          </Link>
        </div>

        {habits.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="text-4xl">📋</div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No habits yet
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your first habit to start tracking.
            </p>
            <Link
              to="/habits/new"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Create your first habit
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onCheckIn={() => handleCheckIn(habit.id)}
                onUncheck={() => handleUncheck(habit.id)}
                checkingIn={checkingIn === habit.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HabitCard({
  habit,
  onCheckIn,
  onUncheck,
  checkingIn,
}: {
  habit: any;
  onCheckIn: () => void;
  onUncheck: () => void;
  checkingIn: boolean;
}) {
  const streakText =
    habit.currentStreak > 0
      ? `${habit.currentStreak} day${habit.currentStreak !== 1 ? "s" : ""}`
      : "Just started";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon || "🎯"}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                {habit.frequency}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                🔥 {streakText}
              </span>
              {habit.description && (
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                  {habit.description}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/habits/${habit.id}`}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✏️
          </Link>
          <button
            onClick={habit.checkedInToday ? onUncheck : onCheckIn}
            disabled={checkingIn}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              habit.checkedInToday
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } disabled:opacity-50`}
          >
            {checkingIn
              ? "..."
              : habit.checkedInToday
                ? "✅ Done"
                : "Check in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}