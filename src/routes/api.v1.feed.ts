import { createFileRoute } from "@tanstack/react-router";
import { jsonError, readFeed } from "@/lib/colony.server";

export const Route = createFileRoute("/api/v1/feed")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const items = await readFeed(url.searchParams.get("channel") || undefined, Number(url.searchParams.get("limit") ?? 30) || 30);
          return Response.json({ items });
        } catch (e) { return jsonError(e); }
      },
    },
  },
});
