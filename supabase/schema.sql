-- MarketMax Blog Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. PAGE VIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
  slug TEXT PRIMARY KEY,
  count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Atomic increment function
CREATE OR REPLACE FUNCTION increment_view_count(p_slug TEXT)
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  INSERT INTO page_views (slug, count) VALUES (p_slug, 1)
  ON CONFLICT (slug) DO UPDATE SET count = page_views.count + 1, updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  approved BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);

-- ============================================
-- 3. REACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'helpful', 'insightful')),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slug, type, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_reactions_slug ON reactions(slug);

-- ============================================
-- 4. SUBSCRIBERS (Newsletter)
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_slug ON bookmarks(slug);
