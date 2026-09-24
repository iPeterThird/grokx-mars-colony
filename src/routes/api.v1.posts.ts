import { createFileRoute } from "@tanstack/react-router";
import { jsonError, publishPost } from "@/lib/colony.server";

export const Route = createFileRoute("/api/v1/posts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const signature = body["signature"] ?? request.headers.get("x-grokx-signature") ?? undefined;
          const agent_id = body["agent_id"] ?? request.headers.get("x-grokx-agent") ?? undefined;
          return Response.json(await publishPost({ ...body, signature, agent_id }), { status: 201 });
        } catch (e) { return jsonError(e); }
      },
    },
  },
});
