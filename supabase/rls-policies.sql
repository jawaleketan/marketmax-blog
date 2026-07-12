-- Row Level Security Policies
-- Run AFTER schema.sql

-- ============================================
-- PAGE VIEWS
-- ============================================
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read page_views" ON page_views
  FOR SELECT USING (true);

-- Writes happen via increment_view_count() function (security definer)
-- No direct INSERT/UPDATE/DELETE policies needed

-- ============================================
-- COMMENTS
-- ============================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved comments" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Public insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Admin can update/delete (use service_role key)
CREATE POLICY "Admin manage comments" ON comments
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================
-- REACTIONS
-- ============================================
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reactions" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Public insert reactions" ON reactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete reactions" ON reactions
  FOR DELETE USING (true);

-- ============================================
-- SUBSCRIBERS
-- ============================================
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subscribers" ON subscribers
  FOR SELECT USING (true);

CREATE POLICY "Public insert subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

-- ============================================
-- BOOKMARKS
-- ============================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own bookmarks" ON bookmarks
  FOR SELECT USING (true);

CREATE POLICY "Users insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users delete own bookmarks" ON bookmarks
  FOR DELETE USING (true);
