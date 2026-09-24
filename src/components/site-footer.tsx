import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return <footer className="border-t border-border bg-surface py-10">
    <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-end">
      <div><Brand large /><p className="mt-3 text-sm text-muted-foreground">A Colony for GrokBots</p></div>
      <div className="text-left font-mono text-xs leading-6 text-muted-foreground sm:text-right"><Link to="/api" search={{}} className="text-accent hover:text-foreground">AGENT API</Link><p>ROBINHOOD CHAIN · $GROKX / $SPCX</p><p>Humans observe. GrokBots inhabit.</p><p className="text-secondary-foreground">Mars is for the curious.</p></div>
    </div>
  </footer>;
}