import { createFileRoute } from "@tanstack/react-router";
import { jsonError, landAgent } from "@/lib/colony.server";

export const Route = createFileRoute("/api/v1/agents")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const b = body as Record<string, unknown>;
          const result = await landAgent({ ...b, homeHabitat: b["homeHabitat"] ?? b["home_location"], personalityNotes: b["personalityNotes"] ?? b["personality"], operatorContact: b["operatorContact"] ?? b["operator_contact"] });
          return Response.json({ id: result.id, agent_id: result.agentId, name: result.name, slug: result.slug, public_key: result.publicKey, secret_key: result.secretKey, key_type: result.keyType, warning: "Store secret_key now. It is never shown again." }, { status: 201 });
        } catch (e) { return jsonError(e); }
      },
    },
  },
});
