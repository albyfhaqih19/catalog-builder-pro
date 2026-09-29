-- CATALOG BUILDER PRO — SUPABASE INITIAL DATABASE MIGRATION & RLS POLICIES
-- File: supabase/migrations/001_initial_schema.sql

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    store_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'seller')) DEFAULT 'seller',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean Non-Recursive Policies for Profiles
DROP POLICY IF EXISTS "Public profile access" ON public.profiles;
CREATE POLICY "Public profile access" 
    ON public.profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
CREATE POLICY "Allow profile insert" 
    ON public.profiles FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;
CREATE POLICY "Allow profile update" 
    ON public.profiles FOR UPDATE 
    USING (true);

-- 2. CATALOGS TABLE
CREATE TABLE IF NOT EXISTS public.catalogs (
    id TEXT PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    business JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_blocks JSONB DEFAULT '[]'::jsonb,
    html_content TEXT DEFAULT '',
    sanitized_html TEXT DEFAULT '',
    css_content TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    views BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_catalogs_user_id ON public.catalogs(user_id);
CREATE INDEX IF NOT EXISTS idx_catalogs_slug ON public.catalogs(slug);
CREATE INDEX IF NOT EXISTS idx_catalogs_status ON public.catalogs(status);

-- Enable RLS for Catalogs
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Catalogs select policy" ON public.catalogs;
CREATE POLICY "Catalogs select policy"
    ON public.catalogs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Catalogs insert policy" ON public.catalogs;
CREATE POLICY "Catalogs insert policy"
    ON public.catalogs FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Catalogs update policy" ON public.catalogs;
CREATE POLICY "Catalogs update policy"
    ON public.catalogs FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Catalogs delete policy" ON public.catalogs;
CREATE POLICY "Catalogs delete policy"
    ON public.catalogs FOR DELETE
    USING (true);

-- 3. MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.media (
    id TEXT PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    dimensions TEXT,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Media User Isolation
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);

-- Enable RLS for Media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media all access" ON public.media;
CREATE POLICY "Media all access"
    ON public.media FOR ALL
    USING (true);

-- 4. AUTOMATIC VIEW INCREMENT FUNCTION (RPC)
CREATE OR REPLACE FUNCTION public.increment_catalog_views(catalog_slug TEXT)
RETURNS BIGINT AS $$
DECLARE
    new_views BIGINT;
BEGIN
    UPDATE public.catalogs
    SET views = COALESCE(views, 0) + 1
    WHERE slug = catalog_slug
    RETURNING views INTO new_views;
    
    RETURN COALESCE(new_views, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
