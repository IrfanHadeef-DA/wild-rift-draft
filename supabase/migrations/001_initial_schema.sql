-- ═══════════════════════════════════════════════════════════════════════════
-- Wild Rift Draft — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run: supabase db push (or paste into Supabase SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Custom Types ────────────────────────────────────────────────────────────
CREATE TYPE damage_type AS ENUM ('physical', 'magic', 'mixed');
CREATE TYPE engage_type AS ENUM ('engage', 'peel', 'poke', 'heal', 'utility', 'carry');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');

-- Role type is role-agnostic — supports all 5 positions
CREATE TYPE game_role AS ENUM ('support', 'jungle', 'mid', 'baron', 'dragon');

CREATE TYPE draft_outcome AS ENUM ('win', 'loss', 'unknown');
CREATE TYPE synergy_strength AS ENUM ('weak', 'moderate', 'strong');
CREATE TYPE threat_severity AS ENUM ('low', 'medium', 'high');

-- ─── Users ───────────────────────────────────────────────────────────────────
-- Mirrors auth.users; stores public profile data.
-- Row is auto-created via a trigger when a user signs up.
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Champions ───────────────────────────────────────────────────────────────
-- Role-agnostic: each champion can have multiple roles and engage types.
-- patch_version allows staleness tracking per-champion.
CREATE TABLE IF NOT EXISTS public.champions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,          -- e.g. "thresh", "lulu"
  name          TEXT NOT NULL,
  roles         game_role[] NOT NULL,           -- e.g. '{support}' or '{support,mid}'
  damage_type   damage_type NOT NULL,
  engage_type   engage_type[] NOT NULL,         -- e.g. '{engage,peel}'
  difficulty    difficulty NOT NULL DEFAULT 'medium',
  patch_version TEXT NOT NULL DEFAULT '5.3',
  metadata      JSONB NOT NULL DEFAULT '{}',    -- title, image_url, tags, etc.
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Hero Pools ──────────────────────────────────────────────────────────────
-- Each user can save champions per-role with a self-reported proficiency.
-- proficiency: 1=learning … 5=mastered (used to weight recommendations)
CREATE TABLE IF NOT EXISTS public.hero_pools (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  champion_id   UUID NOT NULL REFERENCES public.champions(id) ON DELETE CASCADE,
  role          game_role NOT NULL,
  proficiency   SMALLINT NOT NULL DEFAULT 3 CHECK (proficiency BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, champion_id, role)           -- no duplicate champion+role combos
);

-- ─── Synergies ───────────────────────────────────────────────────────────────
-- Static synergy weights between champion pairs (patch-versioned).
-- score: 0-100 (100 = strongest synergy)
CREATE TABLE IF NOT EXISTS public.synergies (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  champion_a_id  UUID NOT NULL REFERENCES public.champions(id) ON DELETE CASCADE,
  champion_b_id  UUID NOT NULL REFERENCES public.champions(id) ON DELETE CASCADE,
  score          SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  reason         TEXT NOT NULL,
  patch_version  TEXT NOT NULL DEFAULT '5.3',
  UNIQUE (champion_a_id, champion_b_id)
);

-- ─── Counters ────────────────────────────────────────────────────────────────
-- champion_id is countered BY countered_by_id.
-- severity: 1=slight disadvantage, 5=hard counter
CREATE TABLE IF NOT EXISTS public.counters (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  champion_id      UUID NOT NULL REFERENCES public.champions(id) ON DELETE CASCADE,
  countered_by_id  UUID NOT NULL REFERENCES public.champions(id) ON DELETE CASCADE,
  severity         SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
  reason           TEXT NOT NULL,
  patch_version    TEXT NOT NULL DEFAULT '5.3',
  UNIQUE (champion_id, countered_by_id)
);

-- ─── Draft Sessions ───────────────────────────────────────────────────────────
-- Records each time a user runs an analysis.
-- ally_picks / enemy_picks store champion slugs with optional role assignments.
CREATE TABLE IF NOT EXISTS public.draft_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  picked_champion_id  UUID REFERENCES public.champions(id) ON DELETE SET NULL,
  ally_picks          JSONB NOT NULL DEFAULT '[]',   -- [{champion_id, role?}]
  enemy_picks         JSONB NOT NULL DEFAULT '[]',   -- [{champion_id, role?}]
  outcome             draft_outcome,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Analysis Cache ───────────────────────────────────────────────────────────
-- Caches AI responses keyed by a hash of (ally_picks + enemy_picks + hero_pool).
-- Checked before every Claude API call. Expires after 24 hours.
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_hash      TEXT NOT NULL UNIQUE,
  recommendation  JSONB NOT NULL,
  coaching_panel  JSONB,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hero_pools_user_id ON public.hero_pools(user_id);
CREATE INDEX IF NOT EXISTS idx_hero_pools_champion_id ON public.hero_pools(champion_id);
CREATE INDEX IF NOT EXISTS idx_draft_sessions_user_id ON public.draft_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_sessions_created_at ON public.draft_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_hash ON public.analysis_cache(draft_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON public.analysis_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_champions_slug ON public.champions(slug);
CREATE INDEX IF NOT EXISTS idx_synergies_a ON public.synergies(champion_a_id);
CREATE INDEX IF NOT EXISTS idx_synergies_b ON public.synergies(champion_b_id);
CREATE INDEX IF NOT EXISTS idx_counters_champion ON public.counters(champion_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Every table has RLS enabled. Users can only access their own data.
-- Champions are public read-only.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- Users: can read/update their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Champions: public read for all authenticated users
CREATE POLICY "champions_select_all" ON public.champions
  FOR SELECT TO authenticated USING (true);

-- Hero pools: users own their rows
CREATE POLICY "hero_pools_select_own" ON public.hero_pools
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "hero_pools_insert_own" ON public.hero_pools
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "hero_pools_update_own" ON public.hero_pools
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "hero_pools_delete_own" ON public.hero_pools
  FOR DELETE USING (auth.uid() = user_id);

-- Synergies & Counters: public read for all authenticated users
CREATE POLICY "synergies_select_all" ON public.synergies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "counters_select_all" ON public.counters
  FOR SELECT TO authenticated USING (true);

-- Draft sessions: users own their sessions
CREATE POLICY "draft_sessions_select_own" ON public.draft_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "draft_sessions_insert_own" ON public.draft_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "draft_sessions_update_own" ON public.draft_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Analysis cache: shared across all users (keyed by draft hash, no PII)
CREATE POLICY "analysis_cache_select_all" ON public.analysis_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "analysis_cache_insert_all" ON public.analysis_cache
  FOR INSERT TO authenticated WITH CHECK (true);

-- ─── Trigger: auto-create user profile on signup ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Trigger: auto-update updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Cleanup: remove expired cache entries (run via cron or pg_cron) ─────────
-- This can be scheduled as a Supabase Edge Function cron, or via pg_cron:
-- SELECT cron.schedule('cleanup-analysis-cache', '0 * * * *',
--   $$DELETE FROM public.analysis_cache WHERE expires_at < NOW()$$);
