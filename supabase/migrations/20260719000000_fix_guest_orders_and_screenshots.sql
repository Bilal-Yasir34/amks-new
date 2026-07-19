/*
# Fix Guest Orders and Payment Screenshots Setup

1. Overview:
- Ensures anon & authenticated users can place orders and order_items without RLS errors on guest checkout.
- Ensures anon users can view their placed order on OrderSuccess page by order_number.
- Configures payment-screenshots storage bucket public upload & read policies.
*/

-- 1. ORDERS TABLE POLICIES
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "read_orders" ON orders;
CREATE POLICY "read_orders" ON orders FOR SELECT
  TO anon, authenticated USING (
    order_number IS NOT NULL
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.is_admin()
  );

-- 2. ORDER ITEMS TABLE POLICIES
DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "read_order_items" ON order_items;
CREATE POLICY "read_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id)
  );

-- 3. STORAGE BUCKET setup for payment-screenshots
INSERT INTO storage.buckets (id, name, public) VALUES
('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_insert_payment_screenshots" ON storage.objects;
CREATE POLICY "public_insert_payment_screenshots" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "public_read_payment_screenshots" ON storage.objects;
CREATE POLICY "public_read_payment_screenshots" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'payment-screenshots');
