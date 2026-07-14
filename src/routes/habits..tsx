import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser } from "~/lib/auth-fns";
import { getHabit, updateHabit, deleteHabit } from "~/lib/habits";

const HABIT_ICONS = ["🎯", "💪", "🧘", "📚", "✍️", "🏃", "🥗", "💧", "😴", "🎨", "🎵", "🌱", "🧠", "💡", "🏋️", "🚴", "🧹", "📝", "🎭", "🌈"];
const HABIT_COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16"];

export const Route = createFileRoute("/habits/")({
  component: EditHabitPage,
});

function EditHabitPage() {
  const { id } = useParams({ from: "/habits/$id" });
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [targetCount, setTargetCount] = useState(1);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);

  useEffect(() => {
    async function load() {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          navigate({ to: "/login" });
          return;
        }
        setUser(userData);

        const habit = await getHabit({ data: id });
        setName(habit.name);
        setDescription(habit.description || "");
        setFrequency(habit.frequency);
        setTargetCount(habit.targetCount);
        setColor(habit.color || HABIT_COLORS[0]);
        setIcon(habit.icon || HABIT_ICONS[0]);
      } catch {
        navigate({ to: "/dashboard" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await updateHabit({
        data: {
          id,
          name: name.trim(),
          description: description.trim(),
          frequency,
          targetCount,
          color,
          icon,
        },
      });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to update habit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this habit? All history will be lost.")) return;
    setSaving(true);
    try {
      await deleteHabit({ data: id });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to delete habit");
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Habit
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors"
        >
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Habit name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Frequency
          </label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {(["daily", "weekly", "custom"] as const).map((freq) => (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target count
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={targetCount}
            onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
            className="mt-1 block w-32 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to="/dashboard"
            className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}