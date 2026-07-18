/*
# AMKS Admin Panel Upgrade — Schema Additions

1. Overview
Adds support for: product archiving (archived status), media library tracking,
and customer profile aggregation view.

2. Changes
- products table: adds 'archived' boolean column (default false) to support archive/restore without deleting.
- media_assets table: tracks all uploaded media in Supabase Storage for the media library.
- customers view: aggregates customer data from orders for the customer management page.

3. Security
- RLS enabled on media_assets (public read, authenticated write).
- The customers view is a simple SQL view, no RLS needed (it derives from orders which already has policies).
*/

-- Add archived column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Media library table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  content_type text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media_assets" ON media_assets;
CREATE POLICY "public_read_media_assets" ON media_assets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_media_assets" ON media_assets;
CREATE POLICY "auth_insert_media_assets" ON media_assets FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_media_assets" ON media_assets;
CREATE POLICY "auth_delete_media_assets" ON media_assets FOR DELETE
  TO authenticated USING (true);

-- Customers aggregate view (derived from orders)
CREATE OR REPLACE VIEW customer_summary AS
SELECT
  customer_email,
  MAX(customer_name) AS name,
  MAX(customer_phone) AS phone,
  COUNT(*) AS total_orders,
  COALESCE(SUM(total), 0) AS lifetime_spending,
  MIN(created_at) AS first_order_date,
  MAX(created_at) AS last_order_date
FROM orders
GROUP BY customer_email;
