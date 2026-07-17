import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser } from "~/lib/auth-fns";
import { createHabit } from "~/lib/habits";

const HABIT_ICONS = ["🎯", "💪", "🧘", "📚", "✍️", "🏃", "🥗", "💧", "😴", "🎨", "🎵", "🌱", "🧠", "💡", "🏋️", "🚴", "🧹", "📝", "🎭", "🌈"];
const HABIT_COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16"];

export const Route = createFileRoute("/habits/new")({
  component: NewHabitPage,
});

function NewHabitPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekday" | "weekly" | "custom">("daily");
  const [targetCount, setTargetCount] = useState(1);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          navigate({ to: "/login" });
          return;
        }
        setUser(userData);
      } catch {
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const result = await createHabit({
        data: {
          name: name.trim(),
          description: description.trim(),
          frequency,
          targetCount,
          color,
          icon,
        },
      });

      if (result.success) {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create habit");
    } finally {
      setSaving(false);
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create New Habit
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Define what you want to track and how success looks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Habit name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning meditation"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important to you?"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Frequency
          </label>
          <div className="mt-2 grid grid-cols-4 gap-3">
            {(["daily", "weekday", "weekly", "custom"] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  frequency === freq
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Target Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target count per {frequency === "daily" ? "day" : frequency === "weekday" ? "weekday" : frequency === "weekly" ? "week" : "period"}
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={targetCount}
            onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
            className="mt-1 block w-32 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Icon
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {HABIT_ICONS.map((icn) => (
              <button
                key={icn}
                type="button"
                onClick={() => setIcon(icn)}
                className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                  icon === icn
                    ? "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-900"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                }`}
              >
                {icn}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color
          </label>
          <div className="mt-2 flex gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full transition-transform ${
                  color === c ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {saving ? "Creating..." : "Create Habit"}
        </button>
      </form>
    </div>
  );
}