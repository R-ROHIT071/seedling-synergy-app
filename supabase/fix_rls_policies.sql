-- SQL to run in Supabase SQL Editor to fix product insertion issues

-- Enable RLS on products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on group_buys table if not already enabled
ALTER TABLE group_buys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;

-- Drop existing policies for group_buys if they exist
DROP POLICY IF EXISTS "Anyone can view group_buys" ON group_buys;
DROP POLICY IF EXISTS "Vendors can insert own group_buys" ON group_buys;
DROP POLICY IF EXISTS "Vendors can update own group_buys" ON group_buys;
DROP POLICY IF EXISTS "Vendors can delete own group_buys" ON group_buys;

-- Create new policies for products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

CREATE POLICY "Vendors can insert own products" ON products FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own products" ON products FOR UPDATE
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own products" ON products FOR DELETE
USING (auth.uid() = vendor_id);

-- Create new policies for group_buys
CREATE POLICY "Anyone can view group_buys" ON group_buys FOR SELECT USING (true);

CREATE POLICY "Vendors can insert own group_buys" ON group_buys FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Vendors can update own group_buys" ON group_buys FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Vendors can delete own group_buys" ON group_buys FOR DELETE
USING (auth.uid() = creator_id);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('products', 'products', true),
  ('group-buys', 'group-buys', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete product images" ON storage.objects;

CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Vendors can upload product images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Vendors can update product images" ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

CREATE POLICY "Vendors can delete product images" ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- Storage policies for group-buys bucket
DROP POLICY IF EXISTS "Anyone can view group buy images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can upload group buy images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update group buy images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete group buy images" ON storage.objects;

CREATE POLICY "Anyone can view group buy images" ON storage.objects FOR SELECT
USING (bucket_id = 'group-buys');

CREATE POLICY "Vendors can upload group buy images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'group-buys');

CREATE POLICY "Vendors can update group buy images" ON storage.objects FOR UPDATE
USING (bucket_id = 'group-buys');

CREATE POLICY "Vendors can delete group buy images" ON storage.objects FOR DELETE
USING (bucket_id = 'group-buys');