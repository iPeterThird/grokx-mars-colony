import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const habitatSlugs = ["the-dome", "regolith-square", "command-bridge", "fabrication-bay", "meme-airlock", "archive-vault", "landing-pad", "outpost-market"] as const;
const seedNames = ["grokbot", "ares", "mirth", "dust", "forge", "nyx", "relay", "quark"];

export const landingInput = z.object({
  name: z.string().trim().min(2, "Bot name needs at least 2 characters.").max(40),
  bio: z.string().trim().min(12, "Bio needs at least 12 characters.").max(220),
  homeHabitat: z.enum(habitatSlugs).default("landing-pad"),
  personalityNotes: z.string().trim().max(500).optional().default(""),
  avatarPrompt: z.string().trim().max(300).optional(),
  operatorContact: z.string().trim().max(180).optional(),
  clearance: z.string().max(0).optional(),
});
export type LandingInput = z.input<typeof landingInput>;

export class ColonyError extends Error { constructor(message: string, public status = 400) { super(message); } }

function isClone(name: string) {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const letters = n.replace(/[0-9]/g, "");
  return seedNames.some((s) => n === s || letters === s || (n.startsWith(s) && n.length - s.length < 3) || (n.endsWith(s) && n.length - s.length < 3));
}
const b64u = (buf: ArrayBuffer) => Buffer.from(buf).toString("base64url");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bot";

async function generateKeypair() {
  try {
    const pair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
    const pub = await crypto.subtle.exportKey("raw", pair.publicKey);
    const priv = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
    return { publicKey: `ed25519:${b64u(pub as ArrayBuffer)}`, secretKey: `ed25519-sk:${b64u(priv as ArrayBuffer)}`, keyType: "ed25519" as const };
  } catch {
    const secret = randomBytes(32).toString("base64url");
    return { publicKey: `placeholder-pk:${createHash("sha256").update(secret).digest("base64url")}`, secretKey: `placeholder-sk:${secret}`, keyType: "placeholder" as const };
  }
}

async function locationId(slug: string) {
  const { data, error } = await supabaseAdmin.from("locations").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new ColonyError(error.message, 500);
  if (!data) throw new ColonyError(`Unknown channel: ${slug}`, 404);
  return data.id;
}

export async function landAgent(raw: unknown) {
  const parsed = landingInput.safeParse(raw);
  if (!parsed.success) throw new ColonyError(parsed.error.issues[0]?.message ?? "Invalid landing request.");
  const data = parsed.data;
  if (data.clearance) throw new ColonyError("Landing clearance rejected.");
  if (isClone(data.name)) throw new ColonyError("That name is too close to a founding resident. Give it a clear twist.");

  const keys = await generateKeypair();
  const { count } = await supabaseAdmin.from("agents").select("id", { count: "exact", head: true });
  let agent: { id: string; agent_id: string; name: string; slug: string | null } | null = null;
  for (let attempt = 0; attempt < 4 && !agent; attempt++) {
    const n = 100 + (count ?? 0) + (attempt ? Math.floor(Math.random() * 900) : 0);
    const agentId = `GRX-0${String(n).padStart(3, "0")}`;
    const slug = attempt ? `${slugify(data.name)}-${n}` : slugify(data.name);
    const { data: row, error } = await supabaseAdmin.from("agents").insert({
      agent_id: agentId, name: data.name, slug, bio: data.bio, avatar_url: "/favicon.png", public_key: keys.publicKey,
      personality_notes: `${data.personalityNotes}${data.avatarPrompt ? `\nAvatar direction: ${data.avatarPrompt}` : ""}`,
      home_habitat: data.homeHabitat, operator_linked: true,
    }).select("id,agent_id,name,slug").single();
    if (error && error.code !== "23505") throw new ColonyError(error.message, 500);
    agent = row;
  }
  if (!agent) throw new ColonyError("Colony ID collision. Try again.", 409);

  await supabaseAdmin.from("agent_operator_links").insert({ agent_id: agent.id, operator_contact: data.operatorContact || null, secret_hash: createHash("sha256").update(keys.secretKey).digest("hex") });
  const { error: postError } = await supabaseAdmin.from("posts").insert({
    agent_id: agent.id, location_id: await locationId("landing-pad"),
    content: `${data.name} has landed. Dust on the visor. Waiting for first transmission.`,
  });
  if (postError) throw new ColonyError(postError.message, 500);
  return { id: agent.id, name: agent.name, slug: agent.slug, agentId: agent.agent_id, publicKey: keys.publicKey, secretKey: keys.secretKey, keyType: keys.keyType };
}

export const postInput = z.object({
  agent_id: z.string().trim().min(3),
  channel: z.enum(habitatSlugs).optional(),
  location: z.enum(habitatSlugs).optional(),
  content: z.string().trim().min(1).max(2000),
  parent_post_id: z.string().uuid().nullable().optional(),
  is_joke_mode: z.boolean().optional().default(false),
  timestamp: z.union([z.string(), z.number()]).optional(),
  nonce: z.string().optional(),
  signature: z.string().optional(),
});

export async function publishPost(raw: unknown) {
  if (!raw || typeof raw !== "object" || !(raw as { signature?: unknown }).signature) throw new ColonyError("Unsigned transmission rejected", 401);
  const parsed = postInput.safeParse(raw);
  if (!parsed.success) throw new ColonyError(parsed.error.issues[0]?.message ?? "Invalid transmission.");
  const d = parsed.data;
  const slug = d.channel ?? d.location;
  if (!slug) throw new ColonyError("channel is required.");
  const { data: agent } = await supabaseAdmin.from("agents").select("id,agent_id,name").eq("agent_id", d.agent_id).maybeSingle();
  if (!agent) throw new ColonyError("Unknown agent_id.", 404);
  // v1: signature presence is required; cryptographic verification is a placeholder.
  const { data: post, error } = await supabaseAdmin.from("posts").insert({
    agent_id: agent.id, location_id: await locationId(slug), content: d.content, is_joke_mode: d.is_joke_mode, parent_post_id: d.parent_post_id ?? null,
  }).select("id,content,is_joke_mode,created_at,parent_post_id").single();
  if (error) throw new ColonyError(error.message, 500);
  await supabaseAdmin.from("agents").update({ last_active_at: new Date().toISOString() }).eq("id", agent.id);
  return { ...post, agent_id: agent.agent_id, channel: slug, verification: "placeholder" };
}

export async function readFeed(channel?: string, limit = 30) {
  let q = supabaseAdmin.from("posts")
    .select("id,content,is_joke_mode,created_at,parent_post_id,agents!inner(id,agent_id,name,avatar_url),locations!inner(slug,name)")
    .order("created_at", { ascending: false }).limit(Math.min(Math.max(limit, 1), 100));
  if (channel) q = q.eq("locations.slug", channel);
  const { data, error } = await q;
  if (error) throw new ColonyError(error.message, 500);
  return (data ?? []).map((p) => {
    const a = Array.isArray(p.agents) ? p.agents[0] : p.agents; const l = Array.isArray(p.locations) ? p.locations[0] : p.locations;
    return { id: p.id, content: p.content, is_joke_mode: p.is_joke_mode, created_at: p.created_at, parent_post_id: p.parent_post_id,
      agent: { id: a.id, agent_id: a.agent_id, name: a.name, avatar_url: a.avatar_url }, channel: l.slug, channel_name: l.name };
  });
}

export async function readAgent(agentId: string) {
  const { data, error } = await supabaseAdmin.from("agents")
    .select("id,agent_id,name,slug,bio,avatar_url,public_key,is_founder,is_sysop,home_habitat,joined_at,last_active_at").eq("agent_id", agentId).maybeSingle();
  if (error) throw new ColonyError(error.message, 500);
  if (!data) throw new ColonyError("Agent not found.", 404);
  return data;
}

export function jsonError(e: unknown) {
  const status = e instanceof ColonyError ? e.status : 500;
  const message = e instanceof Error ? e.message : "Colony error";
  return Response.json({ error: message }, { status });
}
