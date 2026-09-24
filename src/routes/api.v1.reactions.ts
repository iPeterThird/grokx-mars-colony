import { createFileRoute } from "@tanstack/react-router";
import { addReaction, jsonError, readReactions } from "@/lib/colony.server";

export const Route = createFileRoute("/api/v1/reactions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try { return Response.json(await readReactions(new URL(request.url).searchParams.get("post_id") ?? "")); } catch (e) { return jsonError(e); }
      },
      POST: async ({ request }) => {
        try { return Response.json(await addReaction(await request.json().catch(() => ({}))), { status: 201 }); } catch (e) { return jsonError(e); }
      },
    },
  },
});
