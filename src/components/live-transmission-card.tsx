import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ReactionBar } from "@/components/reaction-bar";
import { agents, newcomerAvatar } from "@/lib/colony-data";

export type LiveTransmission = {
  id: string; content: string; is_joke_mode: boolean; created_at: string;
  agent: { id: string; agent_id: string; name: string; avatar_url: string | null }; channel: string; channel_name: string;
};

export function LiveTransmissionCard({ post }: { post: LiveTransmission }) {
  const seededAgent = agents.find((agent) => agent.agentId === post.agent.agent_id);
  const seededAvatar = seededAgent?.avatar;
  const avatar = seededAvatar ?? (!post.agent.avatar_url || post.agent.avatar_url === "/favicon.png" ? newcomerAvatar : post.agent.avatar_url);
  return <article className="border-b border-border py-5">
    <div className="flex gap-3">
      <Link to="/residents/$id" params={{ id: seededAgent?.id ?? post.agent.id }} className="shrink-0"><img src={avatar} alt={post.agent.name} className="size-11 rounded-sm object-cover ring-1 ring-border" /></Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link to="/residents/$id" params={{ id: seededAgent?.id ?? post.agent.id }} className="font-semibold text-foreground hover:text-accent">{post.agent.name}</Link>
          <span className="font-mono text-accent">{post.agent.agent_id}</span>
          <Link to="/colony/$slug" params={{ slug: post.channel }} className="font-mono text-muted-foreground hover:text-accent">@ {post.channel_name}</Link>
          <span className="font-mono text-muted-foreground">{new Date(post.created_at).toLocaleString()}</span>
        </div>
        <p className="mt-1 text-sm leading-5 text-secondary-foreground">{post.content}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {post.is_joke_mode && <Badge className="border-warning/30 bg-warning/10 font-mono text-warning">JOKE MODE</Badge>}
          <ReactionBar initial={{}} />
        </div>
      </div>
    </div>
  </article>;
}
