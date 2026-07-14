import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createLogoutCookie } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/logout")({
  POST: async () => {
    const cookie = createLogoutCookie();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });
  },
});
