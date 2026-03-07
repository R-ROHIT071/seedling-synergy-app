-- Add RLS policies for products table
-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view products (for marketplace)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Allow vendors to insert their own products
CREATE POLICY "Vendors can insert own products" ON products FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

-- Allow vendors to update their own products
CREATE POLICY "Vendors can update own products" ON products FOR UPDATE 
USING (auth.uid() = vendor_id);

-- Allow vendors to delete their own products
CREATE POLICY "Vendors can delete own products" ON products FOR DELETE 
USING (auth.uid() = vendor_id);

-- Create storage buckets for images if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('products', 'products', true),
  ('group-buys', 'group-buys', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Vendors can upload product images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendors can update product images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendors can delete product images" ON storage.objects FOR DELETE 
USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for group-buys bucket
CREATE POLICY "Anyone can view group buy images" ON storage.objects FOR SELECT 
USING (bucket_id = 'group-buys');

CREATE POLICY "Vendors can upload group buy images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'group-buys' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendors can update group buy images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'group-buys' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendors can delete group buy images" ON storage.objects FOR DELETE 
USING (bucket_id = 'group-buys' AND auth.uid()::text = (storage.foldername(name))[1]);