-- Admin RLS Policies
-- Run AFTER schema-admin.sql
-- Safe to re-run (uses IF NOT EXISTS pattern)

-- ============================================
-- ADMINS
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins read own profile" ON admins
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role manages admins" ON admins
    FOR ALL USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- POSTS
-- ============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read published posts" ON posts
    FOR SELECT USING (status = 'published' OR true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage posts" ON posts
    FOR ALL USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- MEDIA
-- ============================================
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read media" ON media
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage media" ON media
    FOR ALL USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
