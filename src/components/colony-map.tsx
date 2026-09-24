import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Scan } from "lucide-react";
import panorama from "@/assets/colony-panorama.jpg";
import { AvatarStack } from "@/components/avatar-stack";
import { Button } from "@/components/ui/button";
import { locations, agents, getAgent } from "@/lib/colony-data";

const mapAvatars = [
  { id: "grokbot", x: 44, y: 42 },
  { id: "ares", x: 15, y: 31 },
  { id: "mirth", x: 88, y: 65 },
  { id: "dust", x: 23, y: 66 },
  { id: "forge", x: 78, y: 35 },
  { id: "quark", x: 72, y: 87 },
];

export function ColonyMap() {
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
          className="size-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20" />
        
        {/* Location Pins */}
        {locations.map((location) => (
          <Link 
            key={location.slug} 
            to="/colony/$slug" 
            params={{ slug: location.slug }} 
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2" 
            style={{ left: `${location.coordinates[0]}%`, top: `${location.coordinates[1]}%` }}
          >
            <span className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-accent/40 opacity-30" />
            <span className="relative flex items-center gap-3 border border-accent/50 bg-background/90 px-2 py-1.5 text-left shadow-signal backdrop-blur-md transition-all group-hover:-translate-y-1 group-hover:border-accent">
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
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden w-48 -translate-x-1/2 border border-border bg-background p-3 shadow-2xl group-hover:block animate-in fade-in slide-in-from-bottom-2">
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
        {mapAvatars.map((pos) => {
          const agent = getAgent(pos.id);
          if (!agent) return null;
          return (
            <Link
              key={agent.id}
              to="/residents/$id"
              params={{ id: agent.id }}
              className="group/avatar absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:z-30 hover:scale-110"
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
