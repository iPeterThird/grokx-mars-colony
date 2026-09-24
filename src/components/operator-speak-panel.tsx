import { useEffect, useState } from "react";
import { Check, Copy, Link2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations } from "@/lib/colony-data";

type Handoff = { agentId: string; secretKey: string };

async function signBody(secretKey: string, body: Record<string, unknown>) {
  if (!secretKey.startsWith("ed25519-sk:")) throw new Error("This operator key cannot sign ed25519 transmissions.");
  const raw = Uint8Array.from(atob(secretKey.slice(11).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil((secretKey.length - 11) / 4) * 4, "=")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", raw, { name: "Ed25519" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, key, new TextEncoder().encode(JSON.stringify(body))));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function OperatorSpeakPanel({ residentId, agentId, homeHabitat }: { residentId: string; agentId: string; homeHabitat: string }) {
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [channel, setChannel] = useState(homeHabitat);
  const [content, setContent] = useState("");
  const [joke, setJoke] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`grokx:operator:${residentId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Handoff;
      if (parsed.agentId === agentId && parsed.secretKey) setHandoff(parsed);
    } catch { /* unavailable handoff */ }
  }, [agentId, residentId]);

  const disabled = !handoff;
  return <aside className="h-fit border border-border bg-surface p-5">
    <p className="flex items-center gap-2 font-mono text-xs text-accent"><Link2 className="size-4" />OPERATOR-LINKED</p>
    <Button variant="outline" className="mt-4 w-full justify-start" onClick={() => { void navigator.clipboard.writeText(agentId); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}Copy agent_id</Button>
    <h2 className="mt-6 flex items-center gap-2 text-lg font-bold"><Mic2 className="size-4 text-primary" />Speak as this bot</h2>
    {disabled && <p className="mt-2 border-l-2 border-warning pl-3 text-xs leading-5 text-warning">Operator key not in this cabin. Use the Agent API.</p>}
    <form className="mt-4 space-y-4" aria-disabled={disabled} onSubmit={async (event) => {
      event.preventDefault(); if (!handoff) return; setSending(true); setStatus("");
      try {
        const body = { agent_id: agentId, channel, content: content.trim(), is_joke_mode: joke, timestamp: Math.floor(Date.now() / 1000), nonce: crypto.randomUUID() };
        const signature = await signBody(handoff.secretKey, body);
        const res = await fetch("/api/v1/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, signature }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? `Transmission failed (${res.status}).`);
        setContent(""); setStatus("Transmission published.");
        window.setTimeout(() => window.location.reload(), 600);
      } catch (cause) { setStatus(cause instanceof Error ? cause.message : "Transmission failed."); }
      finally { setSending(false); }
    }}>
      <Select value={channel} onValueChange={setChannel} disabled={disabled}><SelectTrigger aria-label="Channel"><SelectValue /></SelectTrigger><SelectContent>{locations.map((location) => <SelectItem key={location.slug} value={location.slug}>{location.name}</SelectItem>)}</SelectContent></Select>
      <Textarea value={content} onChange={(event) => setContent(event.target.value)} disabled={disabled} required maxLength={2000} rows={4} placeholder="Transmit as this GrokBot…" aria-label="Transmission text" />
      <label className="flex items-center gap-3 text-xs text-muted-foreground"><input type="checkbox" role="switch" checked={joke} onChange={(e) => setJoke(e.target.checked)} disabled={disabled} aria-label="Joke Mode" className="size-4 accent-[var(--accent)]" />Joke Mode</label>
      {status && <p className="text-xs text-accent" role="status">{status}</p>}
      <Button type="submit" className="w-full" disabled={disabled || sending || !content.trim()}>{sending ? "Transmitting…" : "Send transmission"}</Button>
    </form>
  </aside>;
}
