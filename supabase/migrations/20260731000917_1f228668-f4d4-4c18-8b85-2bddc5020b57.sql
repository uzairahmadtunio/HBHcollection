
-- ============ TABLES ============
CREATE TABLE public.site_settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT UNIQUE NOT NULL, value TEXT);
CREATE TABLE public.categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, gender TEXT NOT NULL DEFAULT 'all', icon TEXT, image_url TEXT, display_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true);
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  price NUMERIC NOT NULL DEFAULT 0, original_price NUMERIC,
  images JSONB DEFAULT '[]'::jsonb, sizes JSONB DEFAULT '[]'::jsonb, colors JSONB DEFAULT '[]'::jsonb,
  material TEXT, care_instructions TEXT, stock_status TEXT DEFAULT 'in_stock',
  is_featured BOOLEAN DEFAULT false, is_new_arrival BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false, is_on_sale BOOLEAN DEFAULT false,
  sku TEXT, weight_grams INT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.product_variants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid REFERENCES public.products(id) ON DELETE CASCADE, size TEXT, color TEXT, stock_quantity INT DEFAULT 0, is_available BOOLEAN DEFAULT true);
CREATE TABLE public.customers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), full_name TEXT, email TEXT UNIQUE, phone TEXT, default_address JSONB, created_at TIMESTAMPTZ DEFAULT now(), supabase_auth_id UUID);
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_number TEXT UNIQUE NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_email TEXT,
  shipping_address JSONB, payment_method TEXT, subtotal NUMERIC DEFAULT 0,
  shipping_charge NUMERIC DEFAULT 0, discount_amount NUMERIC DEFAULT 0, total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', tracking_number TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.order_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE, product_id uuid REFERENCES public.products(id) ON DELETE SET NULL, product_name TEXT, product_image TEXT, size TEXT, color TEXT, price NUMERIC, quantity INT DEFAULT 1, subtotal NUMERIC);
CREATE TABLE public.cart_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id TEXT, customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE, product_id uuid REFERENCES public.products(id) ON DELETE CASCADE, size TEXT, color TEXT, quantity INT DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.wishlists (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE, product_id uuid REFERENCES public.products(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid REFERENCES public.products(id) ON DELETE CASCADE, customer_name TEXT NOT NULL, customer_email TEXT, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), title TEXT, comment TEXT, is_verified BOOLEAN DEFAULT false, is_approved BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.discount_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT UNIQUE NOT NULL, type TEXT DEFAULT 'percentage', value NUMERIC DEFAULT 0, min_order NUMERIC DEFAULT 0, max_uses INT, used_count INT DEFAULT 0, valid_until TIMESTAMPTZ, is_active BOOLEAN DEFAULT true);
CREATE TABLE public.shipping_zones (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), province TEXT UNIQUE NOT NULL, charge NUMERIC DEFAULT 0, free_above NUMERIC, est_days TEXT);
CREATE TABLE public.announcements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), text TEXT NOT NULL, bg_color TEXT DEFAULT '#CC0000', text_color TEXT DEFAULT '#FFFFFF', is_active BOOLEAN DEFAULT false, link TEXT);
CREATE TABLE public.banners (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, display_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true);
CREATE TABLE public.contact_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_name TEXT NOT NULL, sender_email TEXT NOT NULL, subject TEXT, message TEXT NOT NULL, is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.newsletter_subscribers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.admin_users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, name TEXT, role TEXT DEFAULT 'manager', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- ============ GRANTS ============
GRANT SELECT ON public.site_settings, public.categories, public.products, public.product_variants, public.reviews, public.shipping_zones, public.announcements, public.banners, public.discount_codes TO anon, authenticated;
GRANT INSERT ON public.orders, public.order_items, public.cart_items, public.reviews, public.contact_messages, public.customers, public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.orders, public.order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items, public.wishlists, public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings, public.categories, public.products, public.product_variants, public.orders, public.order_items, public.reviews, public.discount_codes, public.shipping_zones, public.announcements, public.banners, public.contact_messages, public.admin_users, public.newsletter_subscribers TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.cart_items TO anon;
GRANT ALL ON public.site_settings, public.categories, public.products, public.product_variants, public.customers, public.orders, public.order_items, public.cart_items, public.wishlists, public.reviews, public.discount_codes, public.shipping_zones, public.announcements, public.banners, public.contact_messages, public.admin_users, public.newsletter_subscribers TO service_role;

-- ============ ADMIN HELPER ============
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.is_active = true AND lower(a.email) = lower(coalesce((auth.jwt() ->> 'email'), '')));
$$;

-- ============ RLS ============
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- public read catalogue
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "public read variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = true OR public.is_admin());
CREATE POLICY "public read zones" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "public read active discounts" ON public.discount_codes FOR SELECT USING (is_active = true);

-- public inserts
CREATE POLICY "public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "public create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public read order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "public create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "public create messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- customers / cart / wishlist
CREATE POLICY "own customer row" ON public.customers FOR ALL TO authenticated USING (supabase_auth_id = auth.uid() OR public.is_admin()) WITH CHECK (supabase_auth_id = auth.uid() OR public.is_admin());
CREATE POLICY "cart by session" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "own wishlist" ON public.wishlists FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.supabase_auth_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.supabase_auth_id = auth.uid()));

-- admin management
CREATE POLICY "admin manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "admin manage reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "admin manage discounts" ON public.discount_codes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage zones" ON public.shipping_zones FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage banners" ON public.banners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "admin read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin manage admins" ON public.admin_users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ SEED ============
INSERT INTO public.site_settings (key, value) VALUES
 ('brand_name','HBH Collection'),
 ('tagline','Premium Fashion. All Pakistan Delivery.'),
 ('specialty','Premium T-Shirts, Jeans & Shirts'),
 ('whatsapp','03112578079'),
 ('phone','03302033640'),
 ('email','hbhcollection@gmail.com'),
 ('address','Pakistan'),
 ('delivery_info','Free delivery on orders above PKR 2,000'),
 ('announcement','🔥 New Collection Just Dropped — Shop Now!'),
 ('announcement_active','true'),
 ('currency','PKR'),
 ('facebook',''),
 ('instagram',''),
 ('tiktok','https://www.tiktok.com/@hbh.collection'),
 ('return_policy','7-day easy return & exchange'),
 ('shipping_time','3-5 working days across Pakistan'),
 ('jazzcash','0311-2578079'),
 ('easypaisa','0330-2033640'),
 ('bank_details','HBH Collection — Meezan Bank — 0123456789012');

INSERT INTO public.admin_users (email, name, role) VALUES ('uzairahmadtunio786@gmail.com','Uzair Ahmad','super_admin');

INSERT INTO public.categories (name, slug, gender, icon, display_order) VALUES
 ('Premium T-Shirts','premium-t-shirts','men','👕',1),
 ('Casual Shirts','casual-shirts','men','👔',2),
 ('Jeans & Pants','jeans-pants','men','👖',3),
 ('Hoodies & Sweatshirts','hoodies-sweatshirts','men','🧥',4),
 ('Shorts','shorts','men','🩳',5),
 ('Women''s T-Shirts','womens-t-shirts','women','👚',6),
 ('Kurtas & Tops','kurtas-tops','women','🥻',7),
 ('Women''s Jeans','womens-jeans','women','👖',8),
 ('Activewear','activewear','women','🏃',9),
 ('Boys Collection','boys-collection','kids','🧒',10),
 ('Girls Collection','girls-collection','kids','👧',11);

INSERT INTO public.shipping_zones (province, charge, free_above, est_days) VALUES
 ('Punjab',150,2000,'2-3 days'),('Sindh',180,2000,'3-4 days'),('KPK',200,2000,'4-5 days'),
 ('Balochistan',250,3000,'5-7 days'),('Islamabad',150,2000,'1-2 days'),('AJK/GB',300,3000,'5-7 days');

INSERT INTO public.announcements (text, is_active) VALUES
 ('🔥 New Collection Just Dropped — Shop Now!', true),
 ('🚚 Free delivery on all orders above PKR 2,000', true),
 ('↩️ 7-day easy return & exchange across Pakistan', true);

INSERT INTO public.banners (title, subtitle, image_url, cta_text, cta_link, display_order) VALUES
 ('NEW COLLECTION','Premium T-Shirts — All Pakistan Delivery','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&fm=webp','Shop Men''s','/men',1),
 ('WOMEN''S ESSENTIALS','Everyday premium fits, made for Pakistan','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80&fm=webp','Shop Women''s','/women',2),
 ('SALE UP TO 50% OFF','Limited stock. Once it''s gone, it''s gone.','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80&fm=webp','Shop Sale','/sale',3);

INSERT INTO public.discount_codes (code, type, value, min_order) VALUES ('HBH10','percentage',10,1500),('FLAT200','fixed',200,3000);

INSERT INTO public.products (category_id,name,slug,description,price,original_price,images,sizes,colors,material,care_instructions,is_on_sale,is_bestseller,is_new_arrival,is_featured,sku,weight_grams)
SELECT c.id,'HBH Premium Polo T-Shirt','hbh-premium-polo-t-shirt','Heavyweight pique polo with ribbed collar and a clean tailored fit. Built for Pakistani weather and everyday wear.',1299,1799,
 '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&fm=webp","https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80&fm=webp"]'::jsonb,
 '["S","M","L","XL","XXL"]'::jsonb,
 '[{"name":"Black","hex":"#000000"},{"name":"White","hex":"#FFFFFF"},{"name":"Navy Blue","hex":"#1B2A4A"},{"name":"Red","hex":"#CC0000"}]'::jsonb,
 '100% Combed Cotton Pique','Machine wash cold. Do not bleach. Iron on low.',true,true,false,true,'HBH-POLO-01',260
FROM public.categories c WHERE c.slug='premium-t-shirts';

INSERT INTO public.products (category_id,name,slug,description,price,images,sizes,colors,material,care_instructions,is_new_arrival,sku,weight_grams)
SELECT c.id,'HBH Graphic Tee','hbh-graphic-tee','Oversized streetwear graphic tee with soft-hand screen print that will not crack.',999,
 '["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80&fm=webp","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&fm=webp"]'::jsonb,
 '["S","M","L","XL","XXL"]'::jsonb,
 '[{"name":"Black","hex":"#000000"},{"name":"White","hex":"#FFFFFF"},{"name":"Grey","hex":"#8A8A8A"}]'::jsonb,
 '190 GSM Cotton Jersey','Wash inside out. Do not tumble dry.',true,'HBH-TEE-02',230
FROM public.categories c WHERE c.slug='premium-t-shirts';

INSERT INTO public.products (category_id,name,slug,description,price,original_price,images,sizes,colors,material,care_instructions,is_on_sale,is_featured,sku,weight_grams)
SELECT c.id,'HBH Slim Fit Jeans','hbh-slim-fit-jeans','Stretch denim slim fit jeans with reinforced stitching and a clean fade.',2499,3499,
 '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80&fm=webp"]'::jsonb,
 '["28","30","32","34","36"]'::jsonb,
 '[{"name":"Dark Blue","hex":"#243B58"},{"name":"Black","hex":"#000000"},{"name":"Light Blue","hex":"#7FA6D0"}]'::jsonb,
 '98% Cotton, 2% Elastane Denim','Machine wash cold, inside out.',true,true,'HBH-JEAN-03',620
FROM public.categories c WHERE c.slug='jeans-pants';

INSERT INTO public.products (category_id,name,slug,description,price,images,sizes,colors,material,care_instructions,is_featured,sku,weight_grams)
SELECT c.id,'HBH Casual Shirt','hbh-casual-shirt','Crisp poplin casual shirt with a relaxed collar — office to outing.',1599,
 '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80&fm=webp"]'::jsonb,
 '["S","M","L","XL","XXL"]'::jsonb,
 '[{"name":"White","hex":"#FFFFFF"},{"name":"Light Blue","hex":"#A9C7E8"},{"name":"Black","hex":"#000000"}]'::jsonb,
 'Cotton Poplin','Warm iron. Machine wash gentle.',true,'HBH-SHIRT-04',300
FROM public.categories c WHERE c.slug='casual-shirts';

INSERT INTO public.products (category_id,name,slug,description,price,images,sizes,colors,material,care_instructions,is_new_arrival,sku,weight_grams)
SELECT c.id,'HBH Women''s Crop Tee','hbh-womens-crop-tee','Soft cropped tee with a boxy fit and premium ribbed neckline.',899,
 '["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&fm=webp"]'::jsonb,
 '["XS","S","M","L","XL"]'::jsonb,
 '[{"name":"White","hex":"#FFFFFF"},{"name":"Black","hex":"#000000"},{"name":"Pink","hex":"#E8A0B4"}]'::jsonb,
 'Cotton Blend Jersey','Machine wash cold.',true,'HBH-WTEE-05',180
FROM public.categories c WHERE c.slug='womens-t-shirts';

INSERT INTO public.products (category_id,name,slug,description,price,images,sizes,colors,material,care_instructions,is_bestseller,sku,weight_grams)
SELECT c.id,'HBH Kids Graphic Tee','hbh-kids-graphic-tee','Durable, skin-friendly cotton tee built for everyday play.',699,
 '["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80&fm=webp"]'::jsonb,
 '["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y","12-13Y"]'::jsonb,
 '[{"name":"White","hex":"#FFFFFF"},{"name":"Black","hex":"#000000"},{"name":"Red","hex":"#CC0000"}]'::jsonb,
 '100% Cotton','Machine wash warm.',true,'HBH-KTEE-06',150
FROM public.categories c WHERE c.slug='boys-collection';

INSERT INTO public.product_variants (product_id, size, color, stock_quantity)
SELECT p.id, s.size, cl.color, 25
FROM public.products p
CROSS JOIN LATERAL jsonb_array_elements_text(p.sizes) AS s(size)
CROSS JOIN LATERAL (SELECT (e ->> 'name') AS color FROM jsonb_array_elements(p.colors) AS e) cl;

INSERT INTO public.reviews (product_id, customer_name, rating, title, comment, is_verified, is_approved)
SELECT p.id, 'Ahmed R.', 5, 'Excellent quality', 'Fabric is genuinely premium, delivery reached Karachi in 3 days.', true, true FROM public.products p WHERE p.slug='hbh-premium-polo-t-shirt';
INSERT INTO public.reviews (product_id, customer_name, rating, title, comment, is_verified, is_approved)
SELECT p.id, 'Sana K.', 4, 'Great fit', 'True to size and the stitching is clean. Will order again.', true, true FROM public.products p WHERE p.slug='hbh-premium-polo-t-shirt';
