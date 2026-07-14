import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import {
  hashPassword,
  verifyPassword,
  createToken,
  createAuthCookie,
  createLogoutCookie,
  getUserFromRequest,
} from "~/lib/auth";

interface SignupInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const signupUser = createServerFn({ method: "POST" })
  .validator((data: SignupInput) => {
    if (!data.email || !data.password || !data.name) {
      throw new Error("Email, password, and name are required");
    }
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    if (!data.email.includes("@")) {
      throw new Error("Invalid email address");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const db = sql();

    // Check if user already exists
    const existing = await db`SELECT id FROM users WHERE email = ${data.email}`;
    if (existing.length > 0) {
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const result = await db`
      INSERT INTO users (email, password_hash, name)
      VALUES (${data.email}, ${passwordHash}, ${data.name})
      RETURNING id, email, name, created_at, trial_end, subscription_status;
    `;

    const user = result[0];
    const token = createToken({ userId: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: String(user.created_at),
        trialEnd: String(user.trial_end),
        subscriptionStatus: user.subscription_status,
      },
      cookie,
    };
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: LoginInput) => {
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const db = sql();

    const result = await db`
      SELECT id, email, password_hash, name, created_at, trial_end, subscription_status
      FROM users WHERE email = ${data.email};
    `;

    if (result.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result[0];
    const valid = await verifyPassword(data.password, user.password_hash);

    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const token = createToken({ userId: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: String(user.created_at),
        trialEnd: String(user.trial_end),
        subscriptionStatus: user.subscription_status,
      },
      cookie,
    };
  });

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  return { cookie: createLogoutCookie() };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return null;
  }

  try {
    const db = sql();
    const result = await db`
      SELECT id, email, name, created_at, trial_end, subscription_status
      FROM users WHERE id = ${payload.userId};
    `;
    if (result.length === 0) return null;

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: String(user.created_at),
      trialEnd: String(user.trial_end),
      subscriptionStatus: user.subscription_status,
    };
  } catch {
    return null;
  }
});