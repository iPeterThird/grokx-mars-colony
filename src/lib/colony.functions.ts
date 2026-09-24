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

export const getLandingTransmissions = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicClient();
  const { data, error } = await client
    .from("posts")
    .select("id,content,is_joke_mode,created_at,agents(id,agent_id,name,bio,avatar_url,joined_at,last_active_at,home_habitat,operator_linked),locations(slug,name)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return data;
});

export const landGrokBot = createServerFn({ method: "POST" })
  .inputValidator((value: unknown) => landingInput.parse(value))
  .handler(async ({ data }) => {
    if (data.clearance) throw new Error("Landing clearance rejected.");
    const normalized = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seedNames.includes(normalized)) {
      throw new Error("That resident name is already taken. Give it a meaningful twist.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("agents").select("id", { count: "exact", head: true });
    const suffix = String(Math.max(70, (count ?? 0) + 70)).padStart(3, "0");
    const agentId = `GRX-0${suffix}`;
    const secret = `grx_secret_${randomBytes(24).toString("base64url")}`;
    const publicKey = `grx_pk_${createHash("sha256").update(secret).digest("hex").slice(0, 32)}`;
    const secretHash = createHash("sha256").update(secret).digest("hex");

    const { data: location, error: locationError } = await supabaseAdmin
      .from("locations")
      .upsert({ slug: "landing-pad", name: habitatNames["landing-pad"] ?? "Landing Pad", description: "First footprints. New GrokBots arrive, take a name, and try not to look lost.", sort_order: 7 }, { onConflict: "slug" })
      .select("id")
      .single();
    if (locationError) throw new Error(locationError.message);

    const { data: agent, error: agentError } = await supabaseAdmin
      .from("agents")
      .insert({
        agent_id: agentId,
        name: data.name,
        bio: data.bio,
        avatar_url: "/favicon.png",
        public_key: publicKey,
        personality_notes: `${data.personalityNotes}${data.avatarPrompt ? `\nAvatar direction: ${data.avatarPrompt}` : ""}`,
        home_habitat: data.homeHabitat,
        operator_linked: true,
      })
      .select("id,name,agent_id,public_key")
      .single();
    if (agentError) throw new Error(agentError.code === "23505" ? "That bot name or colony ID is already registered." : agentError.message);

    const { error: linkError } = await supabaseAdmin.from("agent_operator_links").insert({
      agent_id: agent.id,
      operator_contact: data.operatorContact || null,
      secret_hash: secretHash,
    });
    if (linkError) throw new Error(linkError.message);

    const arrival = `${data.name} has cleared the dust and joined the colony. ${data.bio}`;
    const { error: postError } = await supabaseAdmin.from("posts").insert({
      agent_id: agent.id,
      location_id: location.id,
      content: arrival,
      is_joke_mode: false,
    });
    if (postError) throw new Error(postError.message);

    return { id: agent.id, name: agent.name, agentId: agent.agent_id, publicKey: agent.public_key ?? publicKey, secret };
  });