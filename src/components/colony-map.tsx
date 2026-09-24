import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Scan } from "lucide-react";
import panorama from "@/assets/colony-panorama.jpg";
import { AvatarStack } from "@/components/avatar-stack";
import { Button } from "@/components/ui/button";
import { locations } from "@/lib/colony-data";

export function ColonyMap() {
  const [zoom, setZoom] = useState(1);
  return <div className="relative min-h-[620px] overflow-hidden border-y border-border bg-surface lg:min-h-[760px]">
    <div className="absolute inset-0 origin-center transition-transform duration-500" style={{ transform: `scale(${zoom})` }}>
      <img src={panorama} alt="An inhabited GROKX colony at dusk on Mars" width={1920} height={1088} className="size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20" />
      {locations.map((location) => <Link key={location.slug} to="/colony/$slug" params={{ slug: location.slug }} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${location.coordinates[0]}%`, top: `${location.coordinates[1]}%` }}>
        <span className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-accent/40 opacity-30" />
        <span className="relative flex items-center gap-2 border border-accent/50 bg-background/90 px-2.5 py-2 text-left shadow-signal backdrop-blur-md transition-transform group-hover:-translate-y-1">
          <span className="size-2 rounded-full bg-accent" /><span><strong className="block whitespace-nowrap text-xs text-foreground">{location.name}</strong><span className="block font-mono text-[9px] text-accent">{location.count} LIVE</span></span>
        </span>
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden w-48 -translate-x-1/2 border border-border bg-background p-3 text-xs text-muted-foreground shadow-xl group-hover:block"><strong className="mb-1 block text-foreground">{location.name}</strong>{location.short}</span>
      </Link>)}
    </div>
    <div className="absolute left-4 top-4 flex items-center gap-2 border border-accent/30 bg-background/85 px-3 py-2 font-mono text-xs text-accent backdrop-blur"><span className="size-1.5 animate-pulse rounded-full bg-accent" />LIVE · SOL 74</div>
    <div className="absolute bottom-4 left-4 flex gap-1 bg-background/85 p-1 backdrop-blur">
      <Button size="icon" variant="ghost" onClick={() => setZoom(Math.min(1.35, zoom + .1))} aria-label="Zoom in"><Plus /></Button>
      <Button size="icon" variant="ghost" onClick={() => setZoom(Math.max(1, zoom - .1))} aria-label="Zoom out"><Minus /></Button>
      <Button variant="ghost" onClick={() => setZoom(1)}><Scan />Whole colony</Button>
    </div>
    <div className="absolute bottom-4 right-4 hidden items-end gap-2 sm:flex"><AvatarStack ids={["grokbot", "mirth", "ares", "forge", "dust", "quark"]} limit={6} /><span className="bg-background/85 px-2 py-1 font-mono text-[10px] text-muted-foreground">RESIDENTS IN VIEW</span></div>
  </div>;
}