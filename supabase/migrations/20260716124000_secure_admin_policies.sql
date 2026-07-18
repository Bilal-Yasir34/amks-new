-- Create or update is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'email') = 'admin@amks.pk'
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. CATEGORIES
DROP POLICY IF EXISTS "auth_manage_categories" ON categories;
CREATE POLICY "auth_manage_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- 2. PRODUCTS
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (public.is_admin());

-- 3. PRODUCT IMAGES
DROP POLICY IF EXISTS "auth_insert_product_images" ON product_images;
CREATE POLICY "auth_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_product_images" ON product_images;
CREATE POLICY "auth_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_product_images" ON product_images;
CREATE POLICY "auth_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (public.is_admin());

-- 4. PRODUCT VARIANT GROUPS
DROP POLICY IF EXISTS "auth_insert_pvg" ON product_variant_groups;
CREATE POLICY "auth_insert_pvg" ON product_variant_groups FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_pvg" ON product_variant_groups;
CREATE POLICY "auth_update_pvg" ON product_variant_groups FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_pvg" ON product_variant_groups;
CREATE POLICY "auth_delete_pvg" ON product_variant_groups FOR DELETE
  TO authenticated USING (public.is_admin());

-- 5. PRODUCT VARIANT VALUES
DROP POLICY IF EXISTS "auth_insert_pvv" ON product_variant_values;
CREATE POLICY "auth_insert_pvv" ON product_variant_values FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_pvv" ON product_variant_values;
CREATE POLICY "auth_update_pvv" ON product_variant_values FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_pvv" ON product_variant_values;
CREATE POLICY "auth_delete_pvv" ON product_variant_values FOR DELETE
  TO authenticated USING (public.is_admin());

-- 6. PRODUCT VARIANT COMBINATIONS
DROP POLICY IF EXISTS "auth_insert_pvc" ON product_variant_combinations;
CREATE POLICY "auth_insert_pvc" ON product_variant_combinations FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_pvc" ON product_variant_combinations;
CREATE POLICY "auth_update_pvc" ON product_variant_combinations FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_pvc" ON product_variant_combinations;
CREATE POLICY "auth_delete_pvc" ON product_variant_combinations FOR DELETE
  TO authenticated USING (public.is_admin());

-- 7. PRODUCT VARIANT IMAGES
DROP POLICY IF EXISTS "auth_insert_pvi" ON product_variant_images;
CREATE POLICY "auth_insert_pvi" ON product_variant_images FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_pvi" ON product_variant_images;
CREATE POLICY "auth_update_pvi" ON product_variant_images FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_pvi" ON product_variant_images;
CREATE POLICY "auth_delete_pvi" ON product_variant_images FOR DELETE
  TO authenticated USING (public.is_admin());

-- 8. ORDERS
DROP POLICY IF EXISTS "read_own_orders" ON orders;
CREATE POLICY "read_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- 9. ORDER ITEMS
DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "auth_update_order_items" ON order_items;
CREATE POLICY "auth_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_order_items" ON order_items;
CREATE POLICY "auth_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (public.is_admin());

-- 10. COUPONS
DROP POLICY IF EXISTS "auth_insert_coupons" ON coupons;
CREATE POLICY "auth_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_coupons" ON coupons;
CREATE POLICY "auth_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_coupons" ON coupons;
CREATE POLICY "auth_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (public.is_admin());

-- 11. COUPON USAGE
DROP POLICY IF EXISTS "auth_read_coupon_usage" ON coupon_usage;
CREATE POLICY "auth_read_coupon_usage" ON coupon_usage FOR SELECT
  TO authenticated USING (public.is_admin());

-- 12. HERO BANNERS
DROP POLICY IF EXISTS "auth_insert_hero_banners" ON hero_banners;
CREATE POLICY "auth_insert_hero_banners" ON hero_banners FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_hero_banners" ON hero_banners;
CREATE POLICY "auth_update_hero_banners" ON hero_banners FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_hero_banners" ON hero_banners;
CREATE POLICY "auth_delete_hero_banners" ON hero_banners FOR DELETE
  TO authenticated USING (public.is_admin());

-- 13. HOMEPAGE SECTIONS
DROP POLICY IF EXISTS "auth_insert_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_insert_homepage_sections" ON homepage_sections FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_update_homepage_sections" ON homepage_sections FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_delete_homepage_sections" ON homepage_sections FOR DELETE
  TO authenticated USING (public.is_admin());

-- 14. SETTINGS
DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_insert_settings" ON settings;
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- 15. NEWSLETTER SUBSCRIBERS
DROP POLICY IF EXISTS "auth_read_newsletter" ON newsletter_subscribers;
CREATE POLICY "auth_read_newsletter" ON newsletter_subscribers FOR SELECT
  TO authenticated USING (public.is_admin());

-- 16. CONTACT MESSAGES
DROP POLICY IF EXISTS "auth_read_contact_messages" ON contact_messages;
CREATE POLICY "auth_read_contact_messages" ON contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE
  TO authenticated USING (public.is_admin());

-- 17. MEDIA ASSETS
DROP POLICY IF EXISTS "auth_insert_media_assets" ON media_assets;
CREATE POLICY "auth_insert_media_assets" ON media_assets FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_media_assets" ON media_assets;
CREATE POLICY "auth_delete_media_assets" ON media_assets FOR DELETE
  TO authenticated USING (public.is_admin());
