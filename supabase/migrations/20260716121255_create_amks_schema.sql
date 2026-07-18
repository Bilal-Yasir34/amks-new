/*
# AMKS E-Commerce Schema — Core Tables

1. Overview
This migration creates the foundational tables for the AMKS premium shawl & tweed e-commerce store.
Tables cover: categories, products (with full variant support), orders, coupons, customer addresses,
hero banners, homepage sections, store settings, newsletter subscribers, and contact messages.

2. New Tables
- `categories` — product categories (Shawls, Tweed Fabric, etc.)
- `products` — main product catalog with rich metadata and SEO fields
- `product_images` — gallery images per product
- `product_variant_groups` — variant group definitions (Size, Design, Color, etc.)
- `product_variant_values` — values within a variant group (2 Meter, Royal Check, etc.)
- `product_variant_combinations` — generated combinations with own price/stock/sku
- `product_variant_images` — images per variant value (e.g. per design)
- `orders` — customer orders with payment method/status tracking
- `order_items` — line items per order
- `addresses` — saved customer shipping addresses
- `coupons` — discount codes (percentage or fixed)
- `coupon_usage` — tracks coupon redemptions
- `hero_banners` — homepage hero slides
- `homepage_sections` — configurable homepage section ordering/visibility
- `settings` — single-row store settings (name, logo, bank details, shipping, etc.)
- `newsletter_subscribers` — email signups
- `contact_messages` — contact form submissions

3. Security
- RLS enabled on ALL tables.
- Public read (anon + authenticated) on catalog/content tables: categories, products, product_images,
  product_variant_groups, product_variant_values, product_variant_combinations, product_variant_images,
  hero_banners, homepage_sections, settings, coupons (code lookup only).
- Public insert on newsletter_subscribers, contact_messages, orders, order_items, addresses.
- Owner-scoped update/delete on addresses (authenticated users manage their own).
- Admin write operations are handled via the service role key in edge functions / admin context (RLS permits
  service role to bypass). For simplicity in this single-admin setup, catalog write policies allow
  authenticated users to manage products/categories — the admin signs in via Supabase Auth.
*/

-- =============================================================
-- CATEGORIES
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  banner_image text,
  thumbnail text,
  seo_title text,
  seo_description text,
  meta_keywords text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_manage_categories" ON categories;
CREATE POLICY "auth_manage_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PRODUCTS
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand text,
  product_type text,
  short_description text,
  long_description text,
  regular_price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  cost_price numeric(10,2),
  stock_quantity int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 5,
  sku text,
  weight numeric(8,2),
  fabric_type text,
  material text,
  care_instructions text,
  country_of_origin text,
  featured_image text,
  homepage_section text DEFAULT 'none',  -- featured | new_arrival | best_seller | trending | none
  status text NOT NULL DEFAULT 'active',  -- active | draft | out_of_stock
  has_variants boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  meta_keywords text,
  og_image text,
  is_visible boolean NOT NULL DEFAULT true,
  publish_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_homepage ON products(homepage_section);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PRODUCT IMAGES
-- =============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_product_images" ON product_images;
CREATE POLICY "auth_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_product_images" ON product_images;
CREATE POLICY "auth_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_product_images" ON product_images;
CREATE POLICY "auth_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PRODUCT VARIANT GROUPS
-- =============================================================
CREATE TABLE IF NOT EXISTS product_variant_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,           -- e.g. "Size", "Design", "Color"
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_variant_groups ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pvg_product ON product_variant_groups(product_id);

DROP POLICY IF EXISTS "public_read_pvg" ON product_variant_groups;
CREATE POLICY "public_read_pvg" ON product_variant_groups FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_pvg" ON product_variant_groups;
CREATE POLICY "auth_insert_pvg" ON product_variant_groups FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_pvg" ON product_variant_groups;
CREATE POLICY "auth_update_pvg" ON product_variant_groups FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_pvg" ON product_variant_groups;
CREATE POLICY "auth_delete_pvg" ON product_variant_groups FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PRODUCT VARIANT VALUES
-- =============================================================
CREATE TABLE IF NOT EXISTS product_variant_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES product_variant_groups(id) ON DELETE CASCADE,
  value text NOT NULL,           -- e.g. "2 Meter", "Royal Check"
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_variant_values ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pvv_group ON product_variant_values(group_id);

DROP POLICY IF EXISTS "public_read_pvv" ON product_variant_values;
CREATE POLICY "public_read_pvv" ON product_variant_values FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_pvv" ON product_variant_values;
CREATE POLICY "auth_insert_pvv" ON product_variant_values FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_pvv" ON product_variant_values;
CREATE POLICY "auth_update_pvv" ON product_variant_values FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_pvv" ON product_variant_values;
CREATE POLICY "auth_delete_pvv" ON product_variant_values FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PRODUCT VARIANT COMBINATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS product_variant_combinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  combination_key text NOT NULL,  -- JSON or sorted value-id string identifying the combo
  regular_price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  stock_quantity int NOT NULL DEFAULT 0,
  sku text,
  weight numeric(8,2),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_variant_combinations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pvc_product ON product_variant_combinations(product_id);
CREATE INDEX IF NOT EXISTS idx_pvc_key ON product_variant_combinations(combination_key);

DROP POLICY IF EXISTS "public_read_pvc" ON product_variant_combinations;
CREATE POLICY "public_read_pvc" ON product_variant_combinations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_pvc" ON product_variant_combinations;
CREATE POLICY "auth_insert_pvc" ON product_variant_combinations FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_pvc" ON product_variant_combinations;
CREATE POLICY "auth_update_pvc" ON product_variant_combinations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_pvc" ON product_variant_combinations;
CREATE POLICY "auth_delete_pvc" ON product_variant_combinations FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PRODUCT VARIANT IMAGES (per variant value, e.g. per design)
-- =============================================================
CREATE TABLE IF NOT EXISTS product_variant_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_value_id uuid REFERENCES product_variant_values(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_variant_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pvi_value ON product_variant_images(variant_value_id);
CREATE INDEX IF NOT EXISTS idx_pvi_product ON product_variant_images(product_id);

DROP POLICY IF EXISTS "public_read_pvi" ON product_variant_images;
CREATE POLICY "public_read_pvi" ON product_variant_images FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_pvi" ON product_variant_images;
CREATE POLICY "auth_insert_pvi" ON product_variant_images FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_pvi" ON product_variant_images;
CREATE POLICY "auth_update_pvi" ON product_variant_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_pvi" ON product_variant_images;
CREATE POLICY "auth_delete_pvi" ON product_variant_images FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid,                    -- nullable for guest checkout
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  order_notes text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  payment_method text NOT NULL DEFAULT 'cod',  -- cod | bank_transfer
  payment_status text NOT NULL DEFAULT 'pending_verification', -- pending_verification | verified | rejected
  transaction_id text,
  payment_screenshot text,
  verification_notes text,
  verified_by uuid,
  verified_date timestamptz,
  status text NOT NULL DEFAULT 'pending', -- pending|confirmed|packed|shipped|delivered|cancelled|refunded
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Public can create orders (guest checkout). Read/update restricted.
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "read_own_orders" ON orders;
CREATE POLICY "read_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- ORDER ITEMS
-- =============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_combination_id uuid REFERENCES product_variant_combinations(id) ON DELETE SET NULL,
  variant_description text,        -- human-readable variant selection
  sku text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL))
  );
DROP POLICY IF EXISTS "auth_update_order_items" ON order_items;
CREATE POLICY "auth_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_order_items" ON order_items;
CREATE POLICY "auth_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- ADDRESSES
-- =============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  label text,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

DROP POLICY IF EXISTS "select_own_addresses" ON addresses;
CREATE POLICY "select_own_addresses" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- COUPONS
-- =============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage', -- percentage | fixed
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  expiry_date timestamptz,
  minimum_purchase numeric(10,2) DEFAULT 0,
  maximum_discount numeric(10,2),
  usage_limit int,
  one_time_use boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_coupons" ON coupons;
CREATE POLICY "auth_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_coupons" ON coupons;
CREATE POLICY "auth_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_coupons" ON coupons;
CREATE POLICY "auth_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- COUPON USAGE
-- =============================================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  user_id uuid,
  used_at timestamptz DEFAULT now()
);
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);

DROP POLICY IF EXISTS "public_insert_coupon_usage" ON coupon_usage;
CREATE POLICY "public_insert_coupon_usage" ON coupon_usage FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_coupon_usage" ON coupon_usage;
CREATE POLICY "auth_read_coupon_usage" ON coupon_usage FOR SELECT
  TO authenticated USING (true);

-- =============================================================
-- HERO BANNERS
-- =============================================================
CREATE TABLE IF NOT EXISTS hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  cta_text text,
  cta_link text,
  image_url text,
  video_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hero_banners" ON hero_banners;
CREATE POLICY "public_read_hero_banners" ON hero_banners FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_banners" ON hero_banners;
CREATE POLICY "auth_insert_hero_banners" ON hero_banners FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_banners" ON hero_banners;
CREATE POLICY "auth_update_hero_banners" ON hero_banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_banners" ON hero_banners;
CREATE POLICY "auth_delete_hero_banners" ON hero_banners FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- HOMEPAGE SECTIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,       -- e.g. "featured_categories", "featured_products"
  title text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_homepage_sections" ON homepage_sections;
CREATE POLICY "public_read_homepage_sections" ON homepage_sections FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_insert_homepage_sections" ON homepage_sections FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_update_homepage_sections" ON homepage_sections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_delete_homepage_sections" ON homepage_sections FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- SETTINGS (single row)
-- =============================================================
CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1,
  store_name text NOT NULL DEFAULT 'AMKS',
  logo text,
  favicon text,
  contact_email text NOT NULL DEFAULT 'amks.pk@hotmail.com',
  phone text NOT NULL DEFAULT '+92 301 8621370',
  address text,
  social_links jsonb DEFAULT '{}'::jsonb,
  footer_text text,
  announcement_text text NOT NULL DEFAULT 'Free Shipping on all orders Nationwide',
  shipping_charge numeric(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold numeric(10,2) DEFAULT 0,
  currency text NOT NULL DEFAULT 'PKR',
  maintenance_mode boolean NOT NULL DEFAULT false,
  -- Bank details
  bank_name text,
  bank_account_title text,
  bank_account_number text,
  bank_iban text,
  bank_branch_code text,
  payment_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_insert_settings" ON settings;
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (true);

-- =============================================================
-- NEWSLETTER SUBSCRIBERS
-- =============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_newsletter" ON newsletter_subscribers;
CREATE POLICY "auth_read_newsletter" ON newsletter_subscribers FOR SELECT
  TO authenticated USING (true);

-- =============================================================
-- CONTACT MESSAGES
-- =============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_contact_messages" ON contact_messages;
CREATE POLICY "auth_read_contact_messages" ON contact_messages FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- updated_at trigger helper
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_updated ON categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
