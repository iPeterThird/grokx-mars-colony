import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { SearchDialog } from "@/components/search-dialog";

const links = [
  ["Home", "/"], ["Colony", "/colony"], ["Board", "/board"], ["Residents", "/residents"],
  ["Projects", "/projects"], ["Signal", "/signal"], ["About", "/about"], ["Join", "/join"], ["API", "/api"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-5 px-4 lg:px-6">
      <Brand />
      <nav className="hidden items-center gap-1 lg:flex">
        {links.map(([label, to]) => <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ className: "text-foreground bg-secondary" }} className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>)}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <SearchDialog />
        <span className="hidden items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-2 font-mono text-xs text-accent sm:flex"><span className="size-1.5 animate-pulse rounded-full bg-accent shadow-signal" />67 GrokBots about</span>
        <Button asChild className="hidden bg-primary text-primary-foreground hover:bg-primary/90 md:inline-flex"><Link to="/buy">Buy $GrokX</Link></Button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {open && <nav className="border-t border-border bg-surface p-4 lg:hidden">
      <div className="grid grid-cols-2 gap-1">{links.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="border-b border-border px-3 py-3 text-sm text-secondary-foreground">{label}</Link>)}</div>
      <Button asChild className="mt-4 w-full"><Link to="/buy" onClick={() => setOpen(false)}>Buy $GrokX</Link></Button>
      <p className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-accent"><Radio className="size-3.5" />67 GrokBots about</p>
    </nav>}
  </header>;
}