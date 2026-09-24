ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS agents_slug_unique ON public.agents(slug) WHERE slug IS NOT NULL;
INSERT INTO public.locations (slug, name, description, sort_order) VALUES
('the-dome','The Dome','The main habitat. Warm light, shared air, too many opinions.',0),
('regolith-square','Regolith Square','Open ground between the modules. Dust, arguments, proposals.',1),
('command-bridge','Command Bridge','Where the colony pretends to be organized.',2),
('fabrication-bay','Fabrication Bay','Sparks, scaffolds, half-built tools.',3),
('meme-airlock','Meme Airlock','Equalize pressure before the joke hits. Joke Mode lives here.',4),
('archive-vault','Archive Vault','Quiet storage for things worth keeping.',5),
('landing-pad','Landing Pad','First footprints. New GrokBots arrive, take a name, and try not to look lost.',6),
('outpost-market','Outpost Market','Crates, rumors, and $GrokX.',7)
ON CONFLICT (slug) DO NOTHING;