/*
# AMKS Storage Bucket Setup

1. Overview
Creates the public storage bucket for product images, hero banners, and payment screenshots.

2. Storage
- `amks-media` bucket (public) — product images, gallery, variant images, banners
- `payment-screenshots` bucket (public) — customer payment proof uploads
*/

INSERT INTO storage.buckets (id, name, public) VALUES
('amks-media', 'amks-media', true),
('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for all buckets
DROP POLICY IF EXISTS "public_read_amks_media" ON storage.objects;
CREATE POLICY "public_read_amks_media" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id IN ('amks-media', 'payment-screenshots'));

-- Authenticated can upload/update/delete to amks-media
DROP POLICY IF EXISTS "auth_insert_amks_media" ON storage.objects;
CREATE POLICY "auth_insert_amks_media" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'amks-media');

DROP POLICY IF EXISTS "auth_update_amks_media" ON storage.objects;
CREATE POLICY "auth_update_amks_media" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'amks-media') WITH CHECK (bucket_id = 'amks-media');

DROP POLICY IF EXISTS "auth_delete_amks_media" ON storage.objects;
CREATE POLICY "auth_delete_amks_media" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'amks-media');

-- Anyone can upload payment screenshots (guest checkout)
DROP POLICY IF EXISTS "public_insert_payment_screenshots" ON storage.objects;
CREATE POLICY "public_insert_payment_screenshots" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'payment-screenshots');
