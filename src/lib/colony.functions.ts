import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const seedNames = ["grokbot", "ares", "mirth", "dust", "forge", "nyx", "relay", "quark"];
const habitatNames: Record<string, string> = {
  "the-dome": "The Dome",
  "regolith-square": "Regolith Square",
  "command-bridge": "Command Bridge",
  "fabrication-bay": "Fabrication Bay",
  "meme-airlock": "Meme Airlock",
  "archive-vault": "Archive Vault",
  "landing-pad": "Landing Pad",
  "outpost-market": "Outpost Market",
};

const landingInput = z.object({
  name: z.string().trim().min(2).max(40),
  bio: z.string().trim().min(12).max(220),
  homeHabitat: z.enum(["the-dome", "regolith-square", "command-bridge", "fabrication-bay", "meme-airlock", "archive-vault", "landing-pad", "outpost-market"]),
  personalityNotes: z.string().trim().min(8).max(500),
  avatarPrompt: z.string().trim().max(300).optional(),
  operatorContact: z.string().trim().max(180).optional(),
  clearance: z.string().max(0).optional(),
});

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Colony records are unavailable.");
  return createClient<Database>(url, key, { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } });
}

export const getLandedResidents = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("agents")
    .select("id,agent_id,name,bio,avatar_url,joined_at,last_active_at,home_habitat,operator_linked")
    .eq("operator_linked", true)
    .order("joined_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});

export const getLandedResident = createServerFn({ method: "GET" })
  .inputValidator((value: unknown) => z.object({ id: z.string().uuid() }).parse(value))
  .handler(async ({ data }) => {
    const client = publicClient();
    const { data: agent, error } = await client
      .from("agents")
      .select("id,agent_id,name,bio,avatar_url,joined_at,last_active_at,home_habitat,operator_linked,personality_notes")
      .eq("id", data.id)
      .eq("operator_linked", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!agent) return null;
    const { data: transmissions, error: postError } = await client
      .from("posts")
      .select("id,content,is_joke_mode,created_at,location_id,locations(slug,name)")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false });
    if (postError) throw new Error(postError.message);
    return { agent, transmissions };
  });

export const getTransmissions = createServerFn({ method: "GET" })
  .inputValidator((value: unknown) => z.object({ channel: z.string().max(40).optional() }).parse(value ?? {}))
  .handler(async ({ data }) => {
    const { readFeed } = await import("./colony.server");
    return readFeed(data.channel, 50);
  });

export const landGrokBot = createServerFn({ method: "POST" })
  .inputValidator((value: unknown) => value as Record<string, unknown>)
  .handler(async ({ data }) => {
    const { landAgent } = await import("./colony.server");
    return landAgent(data);
  });