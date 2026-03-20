-- Add second image column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
