import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { getUserFromRequest } from "~/lib/auth";

interface CreateHabitInput {
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "custom";
  targetCount: number;
  reminderTime?: string;
  color?: string;
  icon?: string;
}

interface UpdateHabitInput {
  id: string;
  name?: string;
  description?: string;
  frequency?: "daily" | "weekly" | "custom";
  targetCount?: number;
  reminderTime?: string | null;
  color?: string;
  icon?: string;
  archived?: boolean;
}

export const getHabits = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Not authenticated");

  const db = sql();
  const habits = await db`
    SELECT h.*, 
      COALESCE(s.current_streak, 0) as current_streak,
      COALESCE(s.longest_streak, 0) as longest_streak,
      hl.completed as checked_in_today
    FROM habits h
    LEFT JOIN streaks s ON s.habit_id = h.id AND s.user_id = h.user_id
    LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.user_id = h.user_id AND hl.date = CURRENT_DATE
    WHERE h.user_id = ${user.userId} AND h.archived = FALSE
    ORDER BY h.created_at DESC;
  `;

  return habits.map((h: any) => ({
    id: h.id,
    name: h.name,
    description: h.description,
    frequency: h.frequency,
    targetCount: h.target_count,
    reminderTime: h.reminder_time,
    color: h.color,
    icon: h.icon,
    createdAt: String(h.created_at),
    currentStreak: h.current_streak,
    longestStreak: h.longest_streak,
    checkedInToday: h.checked_in_today || false,
  }));
});

export const getHabit = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    const db = sql();
    const result = await db`
      SELECT * FROM habits WHERE id = ${id} AND user_id = ${user.userId};
    `;
    if (result.length === 0) throw new Error("Habit not found");

    const h = result[0];
    return {
      id: h.id,
      name: h.name,
      description: h.description,
      frequency: h.frequency,
      targetCount: h.target_count,
      reminderTime: h.reminder_time,
      color: h.color,
      icon: h.icon,
      createdAt: String(h.created_at),
      archived: h.archived,
    };
  });

export const createHabit = createServerFn({ method: "POST" })
  .validator((data: CreateHabitInput) => {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Habit name is required");
    }
    return data;
  })
  .handler(async ({ data, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    const db = sql();
    const result = await db`
      INSERT INTO habits (user_id, name, description, frequency, target_count, reminder_time, color, icon)
      VALUES (${user.userId}, ${data.name}, ${data.description || ""}, ${data.frequency}, ${data.targetCount || 1}, ${data.reminderTime || null}, ${data.color || "#6366f1"}, ${data.icon || "target"})
      RETURNING id, name, created_at;
    `;

    // Create initial streak record
    await db`
      INSERT INTO streaks (habit_id, user_id, current_streak, longest_streak)
      VALUES (${result[0].id}, ${user.userId}, 0, 0);
    `;

    return { success: true, habit: result[0] };
  });

export const updateHabit = createServerFn({ method: "POST" })
  .validator((data: UpdateHabitInput) => data)
  .handler(async ({ data, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    const db = sql();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = $2");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = $3");
      values.push(data.description);
    }
    if (data.frequency !== undefined) {
      updates.push("frequency = $4");
      values.push(data.frequency);
    }
    if (data.targetCount !== undefined) {
      updates.push("target_count = $5");
      values.push(data.targetCount);
    }
    if (data.reminderTime !== undefined) {
      updates.push("reminder_time = $6");
      values.push(data.reminderTime);
    }
    if (data.color !== undefined) {
      updates.push("color = $7");
      values.push(data.color);
    }
    if (data.icon !== undefined) {
      updates.push("icon = $8");
      values.push(data.icon);
    }
    if (data.archived !== undefined) {
      updates.push("archived = $9");
      values.push(data.archived);
    }

    if (updates.length > 0) {
      await db`
        UPDATE habits SET ${updates.join(", ")}
        WHERE id = ${data.id} AND user_id = ${user.userId};
      `;
    }

    return { success: true };
  });

export const deleteHabit = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    const db = sql();
    await db`DELETE FROM habits WHERE id = ${id} AND user_id = ${user.userId};`;
    return { success: true };
  });

export const checkInHabit = createServerFn({ method: "POST" })
  .validator((data: { habitId: string; note?: string }) => data)
  .handler(async ({ data, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    const db = sql();

    // Insert or update the log
    await db`
      INSERT INTO habit_logs (habit_id, user_id, date, completed, note)
      VALUES (${data.habitId}, ${user.userId}, CURRENT_DATE, TRUE, ${data.note || ""})
      ON CONFLICT (habit_id, user_id, date) 
      DO UPDATE SET completed = TRUE, note = EXCLUDED.note;
    `;

    // Update streak
    await updateStreak(db, data.habitId, user.userId);

    // Check for badges
    await checkBadges(db, data.habitId, user.userId);

    return { success: true };
  });

export const uncheckHabit = createServerFn({ method: "POST" })
  .validator((habitId: string) => habitId)
  .handler(async ({ data: habitId, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    const db = sql();
    await db`
      DELETE FROM habit_logs 
      WHERE habit_id = ${habitId} AND user_id = ${user.userId} AND date = CURRENT_DATE;
    `;

    // Recalculate streak
    await updateStreak(db, habitId, user.userId);

    return { success: true };
  });

async function updateStreak(db: any, habitId: string, userId: string) {
  // Get all completion dates for this habit, ordered desc
  const logs = await db`
    SELECT date FROM habit_logs 
    WHERE habit_id = ${habitId} AND user_id = ${userId} AND completed = TRUE
    ORDER BY date DESC;
  `;

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (logs.length > 0) {
    const lastDate = new Date(logs[0].date);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      // Count consecutive days
      currentStreak = 1;
      for (let i = 1; i < logs.length; i++) {
        const prevDate = new Date(logs[i - 1].date);
        const currDate = new Date(logs[i].date);
        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Get existing streak
  const existing = await db`
    SELECT longest_streak FROM streaks 
    WHERE habit_id = ${habitId} AND user_id = ${userId};
  `;

  const longestStreak = existing.length > 0 
    ? Math.max(existing[0].longest_streak, currentStreak)
    : currentStreak;

  await db`
    INSERT INTO streaks (habit_id, user_id, current_streak, longest_streak, last_checked_date)
    VALUES (${habitId}, ${userId}, ${currentStreak}, ${longestStreak}, CURRENT_DATE)
    ON CONFLICT (habit_id, user_id) 
    DO UPDATE SET current_streak = ${currentStreak}, longest_streak = ${longestStreak}, last_checked_date = CURRENT_DATE;
  `;
}

async function checkBadges(db: any, habitId: string, userId: string) {
  const streak = await db`
    SELECT current_streak FROM streaks 
    WHERE habit_id = ${habitId} AND user_id = ${userId};
  `;

  if (streak.length === 0) return;

  const currentStreak = streak[0].current_streak;
  const milestones = [3, 7, 14, 21, 30, 60, 90, 365];

  for (const milestone of milestones) {
    if (currentStreak >= milestone) {
      // Check if already earned
      const existing = await db`
        SELECT id FROM badges 
        WHERE user_id = ${userId} AND habit_id = ${habitId} AND badge_type = 'streak' AND milestone = ${milestone};
      `;
      if (existing.length === 0) {
        await db`
          INSERT INTO badges (user_id, habit_id, badge_type, milestone)
          VALUES (${userId}, ${habitId}, 'streak', ${milestone});
        `;
      }
    }
  }
}