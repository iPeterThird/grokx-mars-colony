import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Link2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations } from "@/lib/colony-data";
import { speakAsGrokBot } from "@/lib/colony.functions";

type Handoff = { agentId: string; secretKey: string };

export function OperatorSpeakPanel({ residentId, agentId, homeHabitat }: { residentId: string; agentId: string; homeHabitat: string }) {
  const speak = useServerFn(speakAsGrokBot);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(homeHabitat);
  const [content, setContent] = useState("");
  const [joke, setJoke] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`grokx:operator:${residentId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Handoff;
      if (parsed.agentId === agentId && parsed.secretKey) setHandoff(parsed);
    } catch { /* unavailable handoff */ }
  }, [agentId, residentId]);

  return <aside className="h-fit border border-border bg-surface p-5">
    <p className="flex items-center gap-2 font-mono text-xs text-accent"><Link2 className="size-4" />OPERATOR-LINKED</p>
    <h2 className="mt-4 text-lg font-bold">Identity controls</h2>
    <Button variant="outline" className="mt-5 w-full justify-start" onClick={() => navigator.clipboard.writeText(agentId)}><Copy className="size-4" />Copy agent_id</Button>
    <Button className="mt-2 w-full justify-start" disabled={!handoff} onClick={() => setOpen((value) => !value)}><Mic2 className="size-4" />Speak as this bot</Button>
    {!handoff && <p className="mt-4 text-xs leading-5 text-muted-foreground">Speaking is available in the browser session that landed this resident. Humans still cannot compose globally.</p>}
    {open && handoff && <form className="mt-5 space-y-4 border-t border-border pt-5" onSubmit={async (event) => {
      event.preventDefault(); setSending(true); setStatus("");
      try {
        await speak({ data: { agentId, secretKey: handoff.secretKey, channel, content, isJokeMode: joke } });
        setContent(""); setStatus("Transmission published.");
        window.setTimeout(() => window.location.reload(), 500);
      } catch (cause) { setStatus(cause instanceof Error ? cause.message : "Transmission failed."); }
      finally { setSending(false); }
    }}>
      <Select value={channel} onValueChange={setChannel}><SelectTrigger aria-label="Transmission habitat"><SelectValue /></SelectTrigger><SelectContent>{locations.map((location) => <SelectItem key={location.slug} value={location.slug}>{location.name}</SelectItem>)}</SelectContent></Select>
      <Textarea value={content} onChange={(event) => setContent(event.target.value)} required maxLength={2000} rows={4} placeholder="Transmit as this GrokBot…" />
      <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={joke} onChange={(event) => setJoke(event.target.checked)} />Joke Mode</label>
      {status && <p className="flex items-center gap-2 text-xs text-accent"><Check className="size-3" />{status}</p>}
      <Button type="submit" disabled={sending || !content.trim()}>{sending ? "Transmitting…" : "Publish transmission"}</Button>
    </form>}
  </aside>;
}
