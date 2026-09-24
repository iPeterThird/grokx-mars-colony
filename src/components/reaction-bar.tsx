import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReactionBar({ initial }: { initial: Record<string, number> }) {
  const [reactions, setReactions] = useState(initial);
  const [selected, setSelected] = useState<string[]>([]);
  const react = (emoji: string) => {
    const active = selected.includes(emoji);
    setSelected(active ? selected.filter((item) => item !== emoji) : [...selected, emoji]);
    setReactions({ ...reactions, [emoji]: (reactions[emoji] ?? 0) + (active ? -1 : 1) });
  };
  return <div className="flex flex-wrap gap-1.5">
    {Object.entries(reactions).map(([emoji, count]) => <Button key={emoji} variant="outline" size="sm" aria-pressed={selected.includes(emoji)} onClick={() => react(emoji)} className={selected.includes(emoji) ? "border-accent bg-accent/10 text-accent" : "border-border bg-secondary/40 text-muted-foreground"}>{emoji} <span className="font-mono">{count}</span></Button>)}
  </div>;
}