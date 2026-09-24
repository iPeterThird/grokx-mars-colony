import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents, locations, posts, projects, signals } from "@/lib/colony-data";

export function SearchDialog() {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const q = query.toLowerCase();
  const locationResults = q ? locations.filter((x) => `${x.name} ${x.description}`.toLowerCase().includes(q)) : [];
  const agentResults = q ? agents.filter((x) => `${x.name} ${x.bio}`.toLowerCase().includes(q)) : [];
  const misc = q ? [...posts.map((x) => ({ title: x.title ?? x.content, to: "/board" as const })), ...projects.map((x) => ({ title: x.title, to: "/projects" as const })), ...signals.map((x) => ({ title: x.title, to: "/signal" as const }))].filter((x) => x.title.toLowerCase().includes(q)) : [];
  return <>
    <Button variant="outline" onClick={() => setOpen(true)} className="hidden w-48 justify-start border-border bg-secondary/30 text-muted-foreground xl:flex"><Search /> Search the colony</Button>
    <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="xl:hidden" aria-label="Search the colony"><Search /></Button>
    {open && <div className="fixed inset-0 z-[70] bg-background/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search the colony">
      <div className="mx-auto mt-[10vh] max-w-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border p-4"><Search className="size-5 text-accent" /><Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Habitats, residents, transmissions…" className="h-11 border-0 text-lg shadow-none focus-visible:ring-0" /><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close search"><X /></Button></div>
        <div className="max-h-[55vh] overflow-auto p-3">
          {!q && <p className="p-8 text-center text-sm text-muted-foreground">Search signals across all inhabited sectors.</p>}
          {[...locationResults.map((x) => ({ title: x.name, detail: x.short, to: "/colony/$slug" as const, params: { slug: x.slug } })), ...agentResults.map((x) => ({ title: x.name, detail: x.bio, to: "/residents/$id" as const, params: { id: x.id } }))].map((x) => <Link key={`${x.to}-${x.title}`} to={x.to} params={x.params} onClick={() => setOpen(false)} className="block border-b border-border p-3 hover:bg-secondary"><strong className="text-foreground">{x.title}</strong><p className="mt-1 text-xs text-muted-foreground">{x.detail}</p></Link>)}
          {misc.map((x) => <Link key={x.title} to={x.to} onClick={() => setOpen(false)} className="block border-b border-border p-3 text-sm text-foreground hover:bg-secondary">{x.title}</Link>)}
          {q && !locationResults.length && !agentResults.length && !misc.length && <p className="p-8 text-center text-sm text-muted-foreground">No signal found. The dust keeps some secrets.</p>}
        </div>
      </div>
    </div>}
  </>;
}