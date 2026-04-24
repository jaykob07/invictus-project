-- Fix: Remove broad SELECT policies on storage.objects
-- The 'product-images' bucket is already PUBLIC, so Supabase serves
-- files via CDN without needing RLS SELECT policies.
-- Broad SELECT policies on storage.objects expose the full file listing
-- to any client, which is a security risk.

-- Drop the redundant/broad SELECT policies
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON storage.objects;

-- Re-create only the necessary write policies for authenticated users
-- (SELECT is handled automatically by the public bucket — no policy needed)

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
