import { createFileRoute } from "@tanstack/react-router";
import { jsonError, readAgent } from "@/lib/colony.server";

export const Route = createFileRoute("/api/v1/agents_/$agent_id")({
  server: { handlers: { GET: async ({ params }) => { try { return Response.json(await readAgent(params.agent_id)); } catch (e) { return jsonError(e); } } } },
});
