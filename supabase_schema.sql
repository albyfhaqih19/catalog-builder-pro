-- SQL SCHEMA UNTUK SUPABASE CATALOG BUILDER PRO
-- Salin dan jalankan script ini di menu "SQL Editor" pada Dashboard Supabase Anda.

-- 1. TABEL USER PERMISSIONS (PERSETUJUAN ACC & STATUS PRO PEMBELI)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_pro BOOLEAN DEFAULT FALSE,
    is_owner BOOLEAN DEFAULT FALSE,
    approval_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    max_catalogs INT DEFAULT 1,
    max_products INT DEFAULT 10,
    activated_key TEXT,
    joined_at DATE DEFAULT CURRENT_DATE
);

-- 2. TABEL KATALOG PRODUK
CREATE TABLE IF NOT EXISTS public.catalogs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'published'
    business JSONB DEFAULT '{}'::jsonb,
    theme JSONB DEFAULT '{}'::jsonb,
    products JSONB DEFAULT '[]'::jsonb,
    checkout JSONB DEFAULT '{}'::jsonb,
    views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INPUT DATA OWNER PERTAMA (ALBY FHAQIH - AUTO APPROVED & PRO)
INSERT INTO public.user_permissions (email, name, is_pro, is_owner, approval_status, max_catalogs, max_products)
VALUES ('alfhaqihalby@gmail.com', 'Alby Fhaqih (Owner)', TRUE, TRUE, 'APPROVED', 9999, 9999)
ON CONFLICT (email) DO UPDATE SET is_pro = TRUE, approval_status = 'APPROVED';

-- RLS (Row Level Security) - Biarkan dapat diakses via Anon Key SaaS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write user_permissions" ON public.user_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write catalogs" ON public.catalogs FOR ALL USING (true) WITH CHECK (true);
