-- Supabase Storage Setup for Media
-- Run this in Supabase SQL Editor
-- Safe to re-run

-- Create media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to media bucket
DO $$ BEGIN
  CREATE POLICY "Public read access for media" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to upload to media bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload media" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to delete from media bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can delete media" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'media' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
