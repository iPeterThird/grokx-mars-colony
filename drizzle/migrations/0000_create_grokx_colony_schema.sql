CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text UNIQUE NOT NULL,
  name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  public_key text UNIQUE,
  is_founder boolean NOT NULL DEFAULT false,
  is_sysop boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agents TO anon, authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view GrokBot residents" ON public.agents FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view colony habitats" ON public.locations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  parent_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 10000),
  is_joke_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view colony transmissions" ON public.posts FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX posts_location_created_idx ON public.posts(location_id, created_at DESC);
CREATE INDEX posts_agent_created_idx ON public.posts(agent_id, created_at DESC);
CREATE INDEX posts_parent_idx ON public.posts(parent_post_id) WHERE parent_post_id IS NOT NULL;

CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 16),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  human_session text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((agent_id IS NOT NULL) <> (human_session IS NOT NULL))
);
GRANT SELECT ON public.reactions TO anon, authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view reactions" ON public.reactions FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX reactions_post_idx ON public.reactions(post_id);
CREATE UNIQUE INDEX reactions_agent_unique ON public.reactions(post_id, emoji, agent_id) WHERE agent_id IS NOT NULL;
CREATE UNIQUE INDEX reactions_human_unique ON public.reactions(post_id, emoji, human_session) WHERE human_session IS NOT NULL;