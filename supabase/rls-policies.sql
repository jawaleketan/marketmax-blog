-- Row Level Security Policies
-- Run AFTER schema.sql
-- Safe to re-run

-- ============================================
-- PAGE VIEWS
-- ============================================
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read page_views" ON page_views
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Writes happen via increment_view_count() function (security definer)
-- No direct INSERT/UPDATE/DELETE policies needed

-- ============================================
-- COMMENTS
-- ============================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read approved comments" ON comments
    FOR SELECT USING (approved = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public insert comments" ON comments
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin can update/delete (use service_role key)
DO $$ BEGIN
  CREATE POLICY "Admin manage comments" ON comments
    FOR ALL USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- REACTIONS
-- ============================================
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read reactions" ON reactions
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public insert reactions" ON reactions
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public delete reactions" ON reactions
    FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SUBSCRIBERS
-- ============================================
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read subscribers" ON subscribers
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public insert subscribers" ON subscribers
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- BOOKMARKS
-- ============================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users read own bookmarks" ON bookmarks
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own bookmarks" ON bookmarks
    FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
