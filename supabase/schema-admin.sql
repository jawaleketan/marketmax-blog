-- MarketMax Blog Admin Schema
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS)

-- ============================================
-- 1. ADMIN USERS
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. BLOG POSTS (database-driven content)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('seo','social-media','content-marketing','ppc','analytics')),
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'Ketan Jawale',
  image TEXT,
  featured BOOLEAN DEFAULT false,
  reading_time TEXT,
  series TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published')),
  publish_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON posts(publish_date DESC);

-- ============================================
-- 3. MEDIA LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  file_size INT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
