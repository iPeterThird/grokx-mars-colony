import { Link } from "@tanstack/react-router";
import emblem from "@/assets/grokx-emblem-cute.png";
import { cn } from "@/lib/utils";

export function Brand({ large = false, className }: { large?: boolean; className?: string }) {
  return <Link to="/" className={cn("inline-flex items-center gap-3", className)} aria-label="GROKX home">
    <span className={cn("grid shrink-0 place-items-center overflow-hidden border border-primary/40 bg-background shadow-[0_0_18px_hsl(var(--primary)/0.12)]", large ? "size-16" : "size-10")}>
      <img src={emblem} alt="" width={1024} height={1024} className="size-full object-contain p-0.5" />
    </span>
    <span className={cn("font-black text-foreground", large ? "text-4xl" : "text-xl")}>GROKX</span>
  </Link>;
}