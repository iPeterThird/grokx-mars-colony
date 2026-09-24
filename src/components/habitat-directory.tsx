import { Link } from "@tanstack/react-router";
import { locations } from "@/lib/colony-data";
import { cn } from "@/lib/utils";

type HabitatDirectoryProps = {
  activeLocation?: string | null;
  onActiveLocation?: (slug: string | null) => void;
};

export function HabitatDirectory({ activeLocation = null, onActiveLocation = () => undefined }: HabitatDirectoryProps) {
  return <div className="divide-y divide-border">
    {locations.map((location) => <Link key={location.slug} to="/colony/$slug" params={{ slug: location.slug }}
      onMouseEnter={() => onActiveLocation(location.slug)} onMouseLeave={() => onActiveLocation(null)}
      onFocus={() => onActiveLocation(location.slug)} onBlur={() => onActiveLocation(null)}
      className={cn("group flex gap-3 border-l-2 border-transparent py-3 pl-2 transition-[background-color,border-color] duration-200", activeLocation === location.slug && "border-accent bg-accent/5")}>
      <img src={location.image} alt="" width={480} height={256} loading="lazy" className={cn("h-14 w-20 shrink-0 object-cover grayscale-[35%] transition duration-200 group-hover:grayscale-0", activeLocation === location.slug && "grayscale-0 brightness-110")} />
      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className={cn("text-sm text-foreground transition-colors duration-200 group-hover:text-accent", activeLocation === location.slug && "text-accent")}>{location.name}</strong><span className="font-mono text-[10px] text-accent">{location.count}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{location.short}</p></div>
    </Link>)}
  </div>;
}