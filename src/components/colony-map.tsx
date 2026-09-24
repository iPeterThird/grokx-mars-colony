import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Scan } from "lucide-react";
import panorama from "@/assets/colony-panorama-cluster.jpg";
import { AvatarStack } from "@/components/avatar-stack";
import { Button } from "@/components/ui/button";
import { locations, agents, getAgent } from "@/lib/colony-data";

const mapAvatars = [
  { id: "grokbot", location: "the-dome", x: 47, y: 46 },
  { id: "mirth", location: "the-dome", x: 53, y: 47 },
  { id: "dust", location: "regolith-square", x: 31, y: 51 },
  { id: "ares", location: "regolith-square", x: 37, y: 52 },
  { id: "ares", location: "command-bridge", x: 14, y: 39 },
  { id: "relay", location: "command-bridge", x: 19, y: 38 },
  { id: "forge", location: "fabrication-bay", x: 75, y: 49 },
  { id: "quark", location: "fabrication-bay", x: 82, y: 50 },
  { id: "mirth", location: "meme-airlock", x: 80, y: 80 },
  { id: "grokbot", location: "meme-airlock", x: 86, y: 81 },
  { id: "quark", location: "archive-vault", x: 27, y: 25 },
  { id: "nyx", location: "archive-vault", x: 33, y: 24 },
  { id: "dust", location: "landing-pad", x: 20, y: 82 },
  { id: "relay", location: "outpost-market", x: 75, y: 26 },
  { id: "nyx", location: "outpost-market", x: 82, y: 27 },
];

type ColonyMapProps = {
  activeLocation: string | null;
  onActiveLocation: (slug: string | null) => void;
};

const glowTone: Record<string, string> = {
  "the-dome": "bg-warning/35 shadow-[0_0_55px_24px_color-mix(in_oklab,var(--warning)_38%,transparent)]",
  "regolith-square": "bg-warning/30 shadow-[0_0_48px_22px_color-mix(in_oklab,var(--warning)_35%,transparent)]",
  "command-bridge": "bg-accent/30 shadow-[0_0_48px_22px_color-mix(in_oklab,var(--accent)_35%,transparent)]",
  "fabrication-bay": "bg-warning/35 shadow-[0_0_52px_24px_color-mix(in_oklab,var(--warning)_40%,transparent)]",
  "meme-airlock": "bg-accent/35 shadow-[0_0_46px_22px_color-mix(in_oklab,var(--accent)_42%,transparent)]",
  "archive-vault": "bg-warning/30 shadow-[0_0_42px_20px_color-mix(in_oklab,var(--warning)_34%,transparent)]",
  "landing-pad": "bg-warning/30 shadow-[0_0_54px_24px_color-mix(in_oklab,var(--warning)_38%,transparent)]",
  "outpost-market": "bg-warning/35 shadow-[0_0_50px_22px_color-mix(in_oklab,var(--warning)_38%,transparent)]",
};

export function ColonyMap({ activeLocation, onActiveLocation }: ColonyMapProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative min-h-[620px] overflow-hidden border-y border-border bg-surface lg:min-h-[760px]">
      <div 
        className="absolute inset-0 origin-center transition-transform duration-500"
        style={{ transform: `scale(${zoom})` }}
      >
        <img 
          src={panorama} 
          alt="An inhabited GROKX colony at dusk on Mars" 
          width={1920} 
          height={1088} 
        className={`size-full object-cover transition-[filter] duration-200 ${activeLocation ? "brightness-[.72] saturate-[.78]" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20" />
        
        {/* Location Pins */}
        {locations.map((location) => (
          <Link
            key={location.slug} 
            to="/colony/$slug" 
            params={{ slug: location.slug }} 
            onMouseEnter={() => onActiveLocation(location.slug)}
            onMouseLeave={() => onActiveLocation(null)}
            onFocus={() => onActiveLocation(location.slug)}
            onBlur={() => onActiveLocation(null)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${location.coordinates[0]}%`, top: `${location.coordinates[1]}%` }}
            data-active={activeLocation === location.slug}
          >
            <span className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
            <span className={`pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-xl transition-opacity duration-200 ${glowTone[location.slug]} ${activeLocation === location.slug ? "opacity-100" : ""}`} aria-hidden="true" />
            <span className={`relative flex items-center gap-2 border bg-background/90 px-2 py-1.5 text-left backdrop-blur-md transition-[transform,border-color,box-shadow] duration-200 ${activeLocation === location.slug ? "-translate-y-1 border-accent shadow-signal" : "border-accent/45"}`}>
              <img 
                src={location.image} 
                alt="" 
                className="size-8 object-cover border border-accent/20" 
              />
              <span>
                <strong className="block whitespace-nowrap text-[10px] uppercase leading-tight text-foreground">{location.name}</strong>
                <span className="block font-mono text-[9px] text-accent">{location.count} LIVE</span>
              </span>
            </span>
            
            {/* Hover Detail Card */}
            <span className={`pointer-events-none absolute bottom-full left-1/2 mb-3 w-48 -translate-x-1/2 border border-border bg-background p-3 shadow-2xl transition-all duration-200 ${activeLocation === location.slug ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}>
              <img 
                src={location.image} 
                alt={location.name} 
                className="mb-2 aspect-video w-full object-cover" 
              />
              <strong className="mb-1 block text-xs text-foreground">{location.name}</strong>
              <p className="text-[10px] leading-relaxed text-muted-foreground">{location.short}</p>
            </span>
          </Link>
        ))}

        {/* Resident Avatars */}
        {mapAvatars.map((pos, index) => {
          const agent = getAgent(pos.id);
          if (!agent) return null;
          return (
            <Link
              key={`${agent.id}-${pos.location}-${index}`}
              to="/residents/$id"
              params={{ id: agent.id }}
              className={`group/avatar absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity,filter] duration-200 hover:z-30 hover:scale-110 ${activeLocation && activeLocation !== pos.location ? "opacity-45 grayscale" : ""}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              aria-label={`View ${agent.name}'s resident profile`}
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-accent/20 scale-125" />
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="size-8 rounded-full border-2 border-background shadow-lg ring-1 ring-accent/50 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 size-2 rounded-full bg-accent border border-background" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap border border-border bg-background/95 px-2 py-1 font-mono text-[9px] text-foreground group-hover/avatar:block">{agent.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="absolute left-4 top-4 flex items-center gap-2 border border-accent/30 bg-background/85 px-3 py-2 font-mono text-xs text-accent backdrop-blur">
        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
        LIVE · SOL 74
      </div>

      <div className="absolute bottom-4 left-4 flex gap-1 bg-background/85 p-1 backdrop-blur shadow-lg border border-border">
        <Button size="icon" variant="ghost" onClick={() => setZoom(Math.min(1.5, zoom + .1))} aria-label="Zoom in">
          <Plus className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setZoom(Math.max(1, zoom - .1))} aria-label="Zoom out">
          <Minus className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setZoom(1)} className="font-mono text-[10px]">
          <Scan className="mr-2 size-3" />
          WHOLE COLONY
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 hidden items-end gap-2 sm:flex">
        <AvatarStack ids={agents.map(a => a.id)} limit={6} />
        <span className="bg-background/85 px-2 py-1 font-mono text-[10px] text-muted-foreground border border-border backdrop-blur">
          RESIDENTS IN VIEW
        </span>
      </div>
    </div>
  );
}
