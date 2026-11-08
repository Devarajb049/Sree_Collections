-- =====================================================================
-- SREE COLLECTIONS: STORAGE BUCKET RLS POLICY FIX
-- =====================================================================
-- Run this in your Supabase SQL Editor to allow showroom admin uploads
-- to the 'saree-images' storage bucket.
-- =====================================================================

-- 1. Ensure 'saree-images' bucket is created and public
INSERT INTO storage.buckets (id, name, public)
VALUES ('saree-images', 'saree-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for 'saree-images' bucket
DROP POLICY IF EXISTS "Public can read saree images" ON storage.objects;
DROP POLICY IF EXISTS "Allow saree images read" ON storage.objects;
CREATE POLICY "Allow saree images read"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'saree-images');

DROP POLICY IF EXISTS "Admins can upload saree images" ON storage.objects;
DROP POLICY IF EXISTS "Allow saree images upload" ON storage.objects;
CREATE POLICY "Allow saree images upload"
    ON storage.objects FOR INSERT TO public
    WITH CHECK (bucket_id = 'saree-images');

DROP POLICY IF EXISTS "Admins can update saree images" ON storage.objects;
DROP POLICY IF EXISTS "Allow saree images update" ON storage.objects;
CREATE POLICY "Allow saree images update"
    ON storage.objects FOR UPDATE TO public
    USING (bucket_id = 'saree-images');

DROP POLICY IF EXISTS "Admins can delete saree images" ON storage.objects;
DROP POLICY IF EXISTS "Allow saree images delete" ON storage.objects;
CREATE POLICY "Allow saree images delete"
    ON storage.objects FOR DELETE TO public
    USING (bucket_id = 'saree-images');

-- 3. Products table policies for Showroom Admin Portal
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
CREATE POLICY "Allow insert products"
    ON public.products FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Allow update products" ON public.products;
CREATE POLICY "Allow update products"
    ON public.products FOR UPDATE TO public
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow delete products" ON public.products;
CREATE POLICY "Allow delete products"
    ON public.products FOR DELETE TO public
    USING (true);

