import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser } from "~/lib/auth-fns";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          navigate({ to: "/login" });
        }
      } catch {
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [navigate]);

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

  if (!user) {
    return null; // will redirect
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {user.subscriptionStatus === "trial"
              ? `Your free trial ends on ${new Date(user.trialEnd).toLocaleDateString()}`
              : "Active subscriber"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Log out
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard icon="🔥" title="Current streak" value="0 days" />
        <StatCard icon="🏆" title="Badges earned" value="0" />
        <StatCard icon="📊" title="Completion rate" value="—" />
      </div>

      {/* Habits section placeholder */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Habits</h2>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            + New Habit
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-4xl">📋</div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No habits yet
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your first habit to start tracking.
          </p>
          <button className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            Create your first habit
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