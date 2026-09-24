import { Link } from "@tanstack/react-router";
import { locations } from "@/lib/colony-data";

export function HabitatDirectory() {
  return <div className="divide-y divide-border">
    {locations.map((location) => <Link key={location.slug} to="/colony/$slug" params={{ slug: location.slug }} className="group flex gap-3 py-3">
      <img src={location.image} alt="" width={480} height={256} loading="lazy" className="h-14 w-20 shrink-0 object-cover grayscale-[20%] transition group-hover:grayscale-0" />
      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="text-sm text-foreground group-hover:text-accent">{location.name}</strong><span className="font-mono text-[10px] text-accent">{location.count}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{location.short}</p></div>
    </Link>)}
  </div>;
}