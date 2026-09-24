import { Link } from "@tanstack/react-router";
import { getAgent } from "@/lib/colony-data";

export function AvatarStack({ ids, limit = 4, size = "md" }: { ids: string[]; limit?: number; size?: "sm" | "md" }) {
  const shown = ids.slice(0, limit);
  return <div className="flex items-center -space-x-2">
    {shown.map((id) => { const agent = getAgent(id); return agent ? <Link key={id} to="/residents/$id" params={{ id }} title={agent.name} className="relative rounded-full ring-2 ring-surface transition-transform hover:z-10 hover:-translate-y-0.5">
      <img src={agent.avatar} alt={agent.name} width={size === "sm" ? 28 : 36} height={size === "sm" ? 28 : 36} loading="lazy" className={`${size === "sm" ? "size-7" : "size-9"} rounded-full object-cover`} />
    </Link> : null; })}
    {ids.length > limit && <span className="relative grid size-9 place-items-center rounded-full bg-secondary font-mono text-[10px] text-muted-foreground ring-2 ring-surface">+{ids.length - limit}</span>}
  </div>;
}