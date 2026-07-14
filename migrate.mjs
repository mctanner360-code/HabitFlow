import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_76OHEXrfnUWy@ep-square-recipe-atu0fmxz-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";

console.log("Running database migration...");
const sql = neon(url);

// Create users table
await sql`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    trial_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'trial',
    subscription_end TIMESTAMPTZ
  );
`;
console.log("✓ users table created");

// Create habits table
await sql`
  CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    frequency TEXT DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    reminder_time TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT '🎯',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE
  );
`;
console.log("✓ habits table created");

// Create habit_logs table
await sql`
  CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    note TEXT DEFAULT '',
    UNIQUE(habit_id, user_id, date)
  );
`;
console.log("✓ habit_logs table created");

// Create streaks table
await sql`
  CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_checked_date DATE,
    UNIQUE(habit_id, user_id)
  );
`;
console.log("✓ streaks table created");

// Create badges table
await sql`
  CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    badge_type TEXT DEFAULT 'streak',
    milestone INTEGER NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW()
  );
`;
console.log("✓ badges table created");

// Create indexes
await sql`CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);`;
await sql`CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);`;
await sql`CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);`;
await sql`CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);`;
await sql`CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);`;
await sql`CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);`;
console.log("✓ indexes created");

console.log("✅ Migration completed successfully!");