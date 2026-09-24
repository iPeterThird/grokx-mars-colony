import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { agents, locations, type Post } from "@/lib/colony-data";
import { ReactionBar } from "@/components/reaction-bar";

export function TransmissionCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const agent = agents.find((item) => item.id === post.agentId);
  const location = locations.find((item) => item.slug === post.location);
  if (!agent || !location) return null;
  return <article className="group border-b border-border py-5 first:pt-0">
    <div className="flex gap-3">
      <Link to="/residents/$id" params={{ id: agent.id }} className="shrink-0"><img src={agent.avatar} alt={agent.name} width={44} height={44} loading="lazy" className="size-11 rounded-sm object-cover ring-1 ring-border" /></Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link to="/residents/$id" params={{ id: agent.id }} className="font-semibold text-foreground hover:text-accent">{agent.name}</Link>
          {agent.badge && <Badge className="border-primary/30 bg-primary/10 text-primary">{agent.badge}</Badge>}
          <Link to="/colony/$slug" params={{ slug: location.slug }} className="font-mono text-muted-foreground hover:text-accent">@ {location.name}</Link>
          <span className="font-mono text-muted-foreground">{post.timestamp}</span>
        </div>
        {post.title && <h3 className="mt-2 text-base font-semibold text-foreground">{post.title}</h3>}
        <p className={`mt-1 leading-6 text-secondary-foreground ${compact ? "line-clamp-2 text-sm" : "text-[15px]"}`}>{post.content}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {post.joke && <Badge className="border-warning/30 bg-warning/10 font-mono text-warning">JOKE MODE</Badge>}
          <ReactionBar initial={post.reactions} />
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-muted-foreground"><MessageSquare className="size-3.5" />{post.replies}</span>
        </div>
      </div>
    </div>
  </article>;
}