import { useState, useEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { getUserFromRequest } from "~/lib/auth";
import { Link } from "@tanstack/react-router";

export const getPendingReminders = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const user = getUserFromRequest(request);
  if (!user) return [];

  try {
    const db = sql();
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const habits = await db`
      SELECT id, name, icon, reminder_time
      FROM habits
      WHERE user_id = ${user.userId}
        AND archived = FALSE
        AND reminder_time IS NOT NULL;
    `;

    // Check which habits have reminder times that match the current hour
    const currentHour = new Date().getHours();
    const pending = habits.filter((h: any) => {
      if (!h.reminder_time) return false;
      const reminderHour = parseInt(String(h.reminder_time).split(":")[0], 10);
      return reminderHour === currentHour;
    });

    return pending.map((h: any) => ({
      id: h.id,
      name: h.name,
      icon: h.icon || "🎯",
      reminderTime: String(h.reminder_time).substring(0, 5),
    }));
  } catch {
    return [];
  }
});

interface ReminderBannerProps {
  reminders: Array<{
    id: string;
    name: string;
    icon: string;
    reminderTime: string;
  }>;
  onDismiss: (id: string) => void;
}

export function ReminderBanner({ reminders, onDismiss }: ReminderBannerProps) {
  if (reminders.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-4 space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{reminder.icon}</span>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Time to check in: {reminder.name}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Reminder set for {reminder.reminderTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
              >
                Check in
              </Link>
              <button
                onClick={() => onDismiss(reminder.id)}
                className="text-sm text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}