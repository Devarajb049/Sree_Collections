-- =====================================================================
-- SREE COLLECTIONS - SUPABASE DATABASE & STORAGE SETUP SCRIPT
-- =====================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project-id>/sql
-- 
-- Configures:
-- 1. PostgreSQL Products table with all saree attributes
-- 2. Automatic timestamps via trigger
-- 3. Row Level Security (RLS) protecting customer & admin data
-- 4. Supabase Storage bucket ('saree-images') with public read access
-- 5. Curated initial catalogue seed data (English default)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CREATE PRODUCTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    fabric VARCHAR(100) NOT NULL,
    color VARCHAR(100),
    colors TEXT[] DEFAULT '{}',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= price),
    short_description TEXT,
    description TEXT,
    blouse_details VARCHAR(255) DEFAULT 'Running Blouse 80cm included',
    zari_type VARCHAR(100) DEFAULT 'Tested Gold Zari',
    saree_length VARCHAR(50) DEFAULT '6.3 Meters (including blouse)',
    care_instructions VARCHAR(255) DEFAULT 'Dry Clean Only',
    image_url TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 5 CHECK (stock_quantity >= 0),
    stock_status VARCHAR(50) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high-performance category and search queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ---------------------------------------------------------------------
-- 2. AUTOMATIC UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
-- Enable RLS on the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3.1. Public Read Policy:
-- Unauthenticated customers can ONLY view products where is_active = true
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 3.2. Authenticated Admin Policies:
-- Logged-in administrators have full SELECT, INSERT, UPDATE, DELETE permissions
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products"
    ON public.products
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (true);

-- ---------------------------------------------------------------------
-- 4. STORAGE BUCKET CONFIGURATION FOR SAREE IMAGES
-- ---------------------------------------------------------------------
-- Create 'saree-images' public bucket if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('saree-images', 'saree-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4.1. Allow anyone to view saree images (Public Read)
DROP POLICY IF EXISTS "Public can read saree images" ON storage.objects;
CREATE POLICY "Public can read saree images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'saree-images');

-- 4.2. Allow authenticated admins to upload new saree photos
DROP POLICY IF EXISTS "Admins can upload saree images" ON storage.objects;
CREATE POLICY "Admins can upload saree images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'saree-images');

-- 4.3. Allow authenticated admins to update/replace saree photos
DROP POLICY IF EXISTS "Admins can update saree images" ON storage.objects;
CREATE POLICY "Admins can update saree images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'saree-images');

-- 4.4. Allow authenticated admins to delete saree photos
DROP POLICY IF EXISTS "Admins can delete saree images" ON storage.objects;
CREATE POLICY "Admins can delete saree images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'saree-images');

-- ---------------------------------------------------------------------
-- 5. INITIAL SEED DATA (Curated Saree Catalogue)
-- ---------------------------------------------------------------------
INSERT INTO public.products (
    sku, title, slug, category, fabric, color, colors, price, original_price,
    short_description, description, blouse_details, zari_type, saree_length,
    care_instructions, image_url, stock_quantity, stock_status,
    is_featured, is_new_arrival, is_best_seller, is_active, is_demo
) VALUES
(
    'SRC-101',
    'Royal Crimson Kanchipuram Pure Silk Saree',
    'royal-crimson-kanchipuram-pure-silk-saree',
    'Kanchipuram Silk Sarees',
    'Pure Kanchipuram Mulberry Silk',
    'Crimson Red & Royal Gold',
    ARRAY['Crimson Red', 'Royal Gold'],
    18499.00,
    23999.00,
    'Exquisite crimson red bridal Kanchipuram silk adorned with traditional Mayil (peacock) motifs and heavy temple border.',
    'Handwoven by master weavers of Kanchipuram with pure mulberry silk. Features a rich korvai contrast border, intricately woven temple motifs with pure zari pallu, and an unstitched contrast brocade blouse piece. Ideal for weddings, muhurtham, and auspicious celebrations.',
    'Contrast Gold Brocade Blouse (80 cm unstitched)',
    'Pure Tested Gold Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    6,
    'in_stock',
    true,
    false,
    true,
    true,
    false
),
(
    'SRC-102',
    'Varanasi Midnight Navy Banarasi Katan Silk Saree',
    'varanasi-midnight-navy-banarasi-katan-silk-saree',
    'Banarasi Sarees',
    'Pure Katan Silk',
    'Midnight Navy Blue & Antique Gold',
    ARRAY['Midnight Navy Blue', 'Antique Gold'],
    15999.00,
    19999.00,
    'Opulent Banarasi Katan silk saree with antique kadwa gold zari floral jaal and grand meenakari pallu.',
    'Woven in the spiritual looms of Varanasi, this masterpiece showcases timeless floral vines (bel) and delicate meenakari accents. The lustrous navy backdrop contrasted against warm gold zari lends regal poise.',
    'Tone-on-tone Navy Silk Blouse with Zari border (80 cm)',
    'Antique Gold Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    4,
    'in_stock',
    true,
    true,
    false,
    true,
    false
),
(
    'SRC-103',
    'Emerald Green Dharmavaram Wedding Pattu Saree',
    'emerald-green-dharmavaram-wedding-pattu-saree',
    'Wedding Sarees',
    'Pure Heavy Pattu Silk',
    'Emerald Green & Rani Pink',
    ARRAY['Emerald Green', 'Rani Pink'],
    21999.00,
    27500.00,
    'Traditional South Indian bridal wedding pattu with elephant and chakra buttas, contrast magenta border.',
    'A heritage Dharmavaram handloom saree featuring double-warp pure silk, solid gold zari pallu, and traditional Annapakshi motifs. Designed for bride, mother of the bride, and landmark family events.',
    'Magenta Pink Heavy Brocade Blouse Piece (85 cm)',
    'Pure Gold Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
    3,
    'in_stock',
    true,
    false,
    true,
    true,
    false
),
(
    'SRC-104',
    'Gadwal Pure Handloom Silk Saree with Kuttu Border',
    'gadwal-pure-handloom-silk-saree-kuttu-border',
    'Pattu Sarees',
    'Pure Gadwal Silk & Cotton Body',
    'Mustard Yellow & Deep Purple',
    ARRAY['Mustard Yellow', 'Deep Purple'],
    12499.00,
    15500.00,
    'Authentic Telangana Gadwal handloom featuring pure silk contrast border attached with traditional Kuttu technique.',
    'Renowned for its lightweight comfort and festive shimmer, this Gadwal saree features fine buttas on mustard yellow body with an imposing purple zari border and rich pallu.',
    'Contrast Purple Silk Blouse with zari border (80 cm)',
    'Tested Gold Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1610030469668-9653833a4103?auto=format&fit=crop&w=900&q=80',
    5,
    'in_stock',
    false,
    true,
    false,
    true,
    false
),
(
    'SRC-105',
    'Traditional Mangalagiri Pure Cotton Saree with Nizam Border',
    'traditional-mangalagiri-pure-cotton-saree-nizam-border',
    'Cotton Sarees',
    '100% Pure Combed Handloom Cotton (80s count)',
    'Ivory White & Ganga-Jamuna Border',
    ARRAY['Ivory White', 'Maroon', 'Forest Green'],
    2899.00,
    3699.00,
    'Graceful ivory Mangalagiri handloom cotton with authentic Nizam gold zari border and striped pallu.',
    'Woven in the temple town of Mangalagiri, Andhra Pradesh. Pure breathable cotton certified for supreme comfort during summer, puja rituals, office wear, and classical celebrations.',
    'Running Ivory Cotton Blouse with Zari border (80 cm)',
    'Fine Gold Zari',
    '6.2 Meters (with blouse)',
    'Gentle Handwash / Mild Detergent',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    12,
    'in_stock',
    false,
    false,
    true,
    true,
    false
),
(
    'SRC-106',
    'Pastel Peach Floral Organza Silk Saree with Scallop Border',
    'pastel-peach-floral-organza-silk-saree-scallop-border',
    'Fancy Sarees',
    'Premium Sheer Organza Silk',
    'Pastel Peach & Champagne Gold',
    ARRAY['Pastel Peach', 'Champagne Gold'],
    4999.00,
    6499.00,
    'Ethereal pastel peach sheer organza saree with delicate floral digital print and hand-cut zardozi scallop border.',
    'A modern party-wear favorite offering an airy silhouette with subtle luxury. Adorned with delicate threadwork and gold sequin highlights along the scallop edges. Lightweight and easy to drape.',
    'Unstitched Raw Silk Embroidered Blouse (80 cm)',
    'Champagne Shimmer Thread & Cutwork',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1583391733975-088dd9fe738a?auto=format&fit=crop&w=900&q=80',
    7,
    'in_stock',
    true,
    true,
    false,
    true,
    false
),
(
    'SRC-107',
    'Pochampally Ikat Handloom Silk Saree',
    'pochampally-ikat-handloom-silk-saree',
    'Pattu Sarees',
    'Pure Mulberry Ikat Silk',
    'Black, Ruby Red & White',
    ARRAY['Black', 'Ruby Red', 'White'],
    9899.00,
    12999.00,
    'Geometric Patola motifs woven in the celebrated Pochampally tie-and-dye Ikat style on lustrous silk.',
    'A UNESCO World Heritage recognised craft tradition. Striking contrast pallu and border with intricate geometric diamond double-ikat patterns that symbolize intellect and artistic heritage.',
    'Contrast Ruby Red Silk Blouse (80 cm)',
    'Subtle Zari Border',
    '6.3 Meters (with blouse)',
    'Dry Clean Recommended',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
    4,
    'in_stock',
    false,
    false,
    false,
    true,
    false
),
(
    'SRC-108',
    'Grand Muhurtham Sindoor Red Bridal Kanchipuram Saree',
    'grand-muhurtham-sindoor-red-bridal-kanchipuram-saree',
    'Wedding Sarees',
    'Pure Kanchipuram Brocade Silk',
    'Sindoor Red & Pure Gold',
    ARRAY['Sindoor Red', 'Pure Gold'],
    28999.00,
    34999.00,
    'Magnificent royal bridal Kanchipuram silk with full body gold brocade jaal, Gandaberunda motifs and heavy pallu.',
    'The pinnacle of South Indian bridal elegance. Crafted over 24 days on pit looms with genuine heavy silk weight (over 850 grams) and certified tested zari. A heirloom saree to cherish for generations.',
    'Heavy All-over Zari Brocade Blouse (90 cm)',
    'Authentic Pure Gold Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    2,
    'low_stock',
    true,
    false,
    true,
    true,
    false
),
(
    'SRC-109',
    'Chanderi Silk Cotton Saree with Silver Zari Buttas',
    'chanderi-silk-cotton-saree-silver-zari-buttas',
    'Cotton Sarees',
    'Chanderi Silk-Cotton Blend',
    'Powder Blue & Silver',
    ARRAY['Powder Blue', 'Silver'],
    3499.00,
    4499.00,
    'Subtle and graceful powder blue Chanderi saree adorned with coin buttas in antique silver zari.',
    'Lightweight sheer texture with the natural sheen of silk and coolness of cotton. Ideal for temple visits, corporate events, and day festivities.',
    'Tone-on-tone Chanderi Blouse Piece (80 cm)',
    'Silver Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean or Gentle Hand Wash',
    'https://images.unsplash.com/photo-1610030469894-39c277bf8696?auto=format&fit=crop&w=900&q=80',
    8,
    'in_stock',
    false,
    true,
    false,
    true,
    false
),
(
    'SRC-110',
    'Handblock Indigo Kalamkari Soft Mulmul Cotton Saree',
    'handblock-indigo-kalamkari-soft-mulmul-cotton-saree',
    'Daily Wear Sarees',
    'Pure 100% Breathable Mulmul Cotton',
    'Indigo Blue & Earthy Ochre',
    ARRAY['Indigo Blue', 'Earthy Ochre'],
    1699.00,
    2299.00,
    'Artisanal vegetable-dyed handblock Kalamkari floral saree with feather-soft drape for effortless daily elegance.',
    'Natural dyes derived from indigo, madder, and pomegranate peel. Printed with hand-carved wooden blocks by Andhra artisans. Extremely soft, lightweight, and skin-friendly for all-day wearing.',
    'Matching Kalamkari Print Cotton Blouse (80 cm)',
    'Natural Thread Border',
    '6.2 Meters (with blouse)',
    'First Wash Dry Clean / Hand Wash with Salt',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    15,
    'in_stock',
    false,
    false,
    true,
    true,
    false
),
(
    'SRC-111',
    'Royal Gulabi Pink Banarasi Tanchoi Silk Saree',
    'royal-gulabi-pink-banarasi-tanchoi-silk-saree',
    'Banarasi Sarees',
    'Pure Tanchoi Satin Silk',
    'Gulabi Pink & Rose Gold',
    ARRAY['Gulabi Pink', 'Rose Gold'],
    13999.00,
    17499.00,
    'Extraordinary self-weave Tanchoi technique creating satin embossed paisley patterns in vivid Gulabi pink.',
    'Tanchoi weaving creates a soft embossed finish without floats on the reverse side. Delicately bordered in rose-gold zari, creating unmatched drape and liquid-like sheen.',
    'Matching Pink Satin Silk Blouse (80 cm)',
    'Rose Gold Zari',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    4,
    'in_stock',
    false,
    true,
    false,
    true,
    false
),
(
    'SRC-112',
    'Lavender Georgette Fancy Saree with Foil Mirror Work',
    'lavender-georgette-fancy-saree-foil-mirror-work',
    'Fancy Sarees',
    'Premium Viscose Georgette',
    'Lavender & Silver',
    ARRAY['Lavender', 'Silver'],
    3999.00,
    5299.00,
    'Contemporary party-wear georgette saree featuring delicate chikankari style embroidery and reflective mirror border.',
    'Modern drape that effortlessly flows and flatters. Perfect for sangeet nights, cocktail parties, and festive celebrations. Includes a designer cutwork border.',
    'Designer Banglori Silk Blouse with Embroidered Sleeves (80 cm)',
    'Silver Foil & Resham Work',
    '6.3 Meters (with blouse)',
    'Dry Clean Only',
    'https://images.unsplash.com/photo-1583391733975-088dd9fe738a?auto=format&fit=crop&w=900&q=80',
    0,
    'out_of_stock',
    false,
    false,
    false,
    true,
    false
)
ON CONFLICT (sku) DO NOTHING;
