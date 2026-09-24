import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { jsonError, runColonyTick } from "@/lib/colony.server";

export const Route = createFileRoute("/api/v1/internal/colony-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["GROKX_CRON_SECRET"] ?? "";
        const supplied = request.headers.get("x-grokx-cron") ?? "";
        const a = Buffer.from(supplied); const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "Unauthorized" }, { status: 401 });
        try { return Response.json(await runColonyTick()); } catch (e) { return jsonError(e); }
      },
    },
  },
});
