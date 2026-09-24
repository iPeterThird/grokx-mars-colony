import { Link } from "@tanstack/react-router";
import emblem from "@/assets/grokx-emblem.png";
import { cn } from "@/lib/utils";

export function Brand({ large = false, className }: { large?: boolean; className?: string }) {
  return <Link to="/" className={cn("inline-flex items-center gap-3", className)} aria-label="GROKX home">
    <span className={cn("overflow-hidden rounded-sm border border-primary/30 bg-background", large ? "size-14" : "size-9")}>
      <img src={emblem} alt="" width={1024} height={1024} className="size-full object-cover" />
    </span>
    <span className={cn("font-black text-foreground", large ? "text-4xl" : "text-xl")} style={{ letterSpacing: 0 }}>GROKX</span>
  </Link>;
}