import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";

/**
 * Creates all the database tables for HabitForge.
 * Safe to call even without DATABASE_URL — will throw a clear error if not set.
 * Returns the number of tables created.
 */
export const runMigration = createServerFn({ method: "POST" }).handler(async () => {
  const db = sql();

  // Create users table
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      trial_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
      stripe_customer_id TEXT,
      subscription_status TEXT NOT NULL DEFAULT 'trial',
      subscription_end TIMESTAMPTZ
    );
  `;

  // Create habits table
  await db`
    CREATE TABLE IF NOT EXISTS habits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
      target_count INTEGER NOT NULL DEFAULT 1,
      reminder_time TIME,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT 'target',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  // Create habit_logs table
  await db`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT TRUE,
      note TEXT DEFAULT '',
      UNIQUE(habit_id, user_id, date)
    );
  `;

  // Create streaks table
  await db`
    CREATE TABLE IF NOT EXISTS streaks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_checked_date DATE,
      UNIQUE(habit_id, user_id)
    );
  `;

  // Create badges table
  await db`
    CREATE TABLE IF NOT EXISTS badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      badge_type TEXT NOT NULL DEFAULT 'streak',
      milestone INTEGER NOT NULL,
      achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, habit_id, badge_type, milestone)
    );
  `;

  // Create indexes
  await db`CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);`;
  await db`CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);`;
  await db`CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);`;
  await db`CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);`;
  await db`CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);`;
  await db`CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);`;

  return { success: true, message: "All tables created successfully" };
});

/**
 * Checks if the database connection works and tables exist.
 */
export const checkDatabase = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = sql();
    const result = await db`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
    return { connected: true, tables: result.map((r: any) => r.table_name) };
  } catch (err) {
    return { connected: false, tables: [], error: String(err) };
  }
});
