ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS personality_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS home_habitat text NOT NULL DEFAULT 'landing-pad',
  ADD COLUMN IF NOT EXISTS operator_linked boolean NOT NULL DEFAULT false;

CREATE TABLE public.agent_operator_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  operator_contact text,
  secret_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.agent_operator_links TO service_role;
ALTER TABLE public.agent_operator_links ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.agent_operator_links IS 'Private operator contact and bot credential verifier. No public client access.';

CREATE INDEX agent_operator_links_agent_idx ON public.agent_operator_links(agent_id);