import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "~/db";
import { getUserFromRequest } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/me")({
  GET: async ({ request }) => {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return new Response(JSON.stringify({ user: null }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const db = sql();
      const result = await db`
        SELECT id, email, name, created_at, trial_end, subscription_status
        FROM users WHERE id = ${payload.userId};
      `;
      if (result.length === 0) {
        return new Response(JSON.stringify({ user: null }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const user = result[0];
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: String(user.created_at),
            trialEnd: String(user.trial_end),
            subscriptionStatus: user.subscription_status,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch {
      return new Response(JSON.stringify({ user: null }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
