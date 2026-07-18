/*
# AMKS Seed Data

1. Overview
Inserts sample categories (Shawls, Tweed Fabric), sample products with images,
a hero banner, default homepage sections, default settings row, and a sample coupon.
All sample data is deletable from the admin panel.

2. Data Inserted
- 2 categories: Shawls, Tweed Fabric
- 4 products (2 per category) with gallery images
- 1 product with variants (Size + Design) with combinations and variant images
- 1 hero banner
- Default homepage sections
- Default settings row (single row, id=1)
- 1 sample coupon (WELCOME10)
*/

-- Default settings (single row)
INSERT INTO settings (id, store_name, contact_email, phone, address, footer_text, announcement_text, shipping_charge, free_shipping_threshold, currency, bank_name, bank_account_title, bank_account_number, bank_iban, bank_branch_code, payment_instructions)
VALUES (1, 'AMKS', 'amks.pk@hotmail.com', '+92 301 8621370', 'Lahore, Pakistan', 'AMKS — Premium Shawls & Tweed Fabric. Crafted with luxury.', 'Free Shipping on all orders Nationwide', 250, 5000, 'PKR', 'HBL Bank', 'AMKS Premium Textiles', '0123456789012', 'PK36HABB0000123456789012', '0123', 'Transfer the exact amount and keep your transaction reference number ready for verification.')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug, description, banner_image, thumbnail, sort_order) VALUES
('Shawls', 'shawls', 'Premium handcrafted shawls — Kashmir, wool, and luxury blends.', 'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=1600', 'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
('Tweed Fabric', 'tweed-fabric', 'Premium tweed fabric for bespoke coats and jackets.', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1600', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 2)
ON CONFLICT (slug) DO NOTHING;

-- Products: Shawls
INSERT INTO products (name, slug, category_id, short_description, long_description, regular_price, sale_price, stock_quantity, sku, fabric_type, material, care_instructions, country_of_origin, featured_image, homepage_section, status, has_variants) VALUES
('Premium Kashmir Shawl', 'premium-kashmir-shawl', (SELECT id FROM categories WHERE slug='shawls'), 'Handwoven pure Kashmir wool shawl with intricate traditional patterns.', 'Each Premium Kashmir Shawl is handwoven by master artisans in the valleys of Kashmir. Made from 100% pure Cashmere wool, this shawl offers unparalleled softness, warmth, and elegance. The intricate traditional patterns are a testament to centuries of craftsmanship.', 8500, 7200, 25, 'AMKS-KSH-001', 'Cashmere Wool', '100% Pure Cashmere', 'Dry clean only. Store in a cool, dry place.', 'Pakistan', 'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=1200', 'featured', 'active', false),
('Royal Check Wool Shawl', 'royal-check-wool-shawl', (SELECT id FROM categories WHERE slug='shawls'), 'Luxurious wool shawl featuring a classic royal check pattern.', 'The Royal Check Wool Shawl combines timeless design with premium wool. Featuring a classic royal check pattern, this shawl is perfect for both formal occasions and everyday elegance. Available in multiple sizes and designs.', 12000, null, 40, 'AMKS-RCW-002', 'Merino Wool', 'Premium Merino Wool', 'Dry clean recommended. Do not bleach.', 'Pakistan', 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=1200', 'best_seller', 'active', true)
ON CONFLICT (slug) DO NOTHING;

-- Products: Tweed Fabric
INSERT INTO products (name, slug, category_id, short_description, long_description, regular_price, sale_price, stock_quantity, sku, fabric_type, material, care_instructions, country_of_origin, featured_image, homepage_section, status, has_variants) VALUES
('Scottish Plaid Tweed', 'scottish-plaid-tweed', (SELECT id FROM categories WHERE slug='tweed-fabric'), 'Premium Scottish plaid tweed fabric for bespoke coats.', 'Authentic Scottish plaid tweed fabric, woven from the finest wool blends. Ideal for crafting bespoke coats, jackets, and blazers. The fabric offers excellent durability, warmth, and a timeless aesthetic.', 15000, 13500, 15, 'AMKS-SPT-001', 'Wool Blend', '80% Wool, 20% Cashmere', 'Dry clean only.', 'United Kingdom', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200', 'featured', 'active', false),
('Herringbone Tweed Fabric', 'herringbone-tweed-fabric', (SELECT id FROM categories WHERE slug='tweed-fabric'), 'Classic herringbone tweed fabric for premium coats.', 'The Herringbone Tweed Fabric features a distinctive V-shaped weaving pattern, creating a sophisticated texture perfect for premium coats. Woven from premium wool with a soft finish.', 18000, null, 20, 'AMKS-HTF-002', 'Pure Wool', '100% Pure Wool', 'Dry clean only. Iron on low heat.', 'United Kingdom', 'https://images.pexels.com/photos/67624/pexels-photo-67624.jpeg?auto=compress&cs=tinysrgb&w=1200', 'new_arrival', 'active', false)
ON CONFLICT (slug) DO NOTHING;

-- Product images for Premium Kashmir Shawl
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
((SELECT id FROM products WHERE slug='premium-kashmir-shawl'), 'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
((SELECT id FROM products WHERE slug='premium-kashmir-shawl'), 'https://images.pexels.com/photos/631139/pexels-photo-631139.jpeg?auto=compress&cs=tinysrgb&w=1200', 2),
((SELECT id FROM products WHERE slug='premium-kashmir-shawl'), 'https://images.pexels.com/photos/631107/pexels-photo-631107.jpeg?auto=compress&cs=tinysrgb&w=1200', 3);

-- Product images for Royal Check Wool Shawl (has variants)
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=800', 2);

-- Product images for Scottish Plaid Tweed
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
((SELECT id FROM products WHERE slug='scottish-plaid-tweed'), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
((SELECT id FROM products WHERE slug='scottish-plaid-tweed'), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', 2);

-- Product images for Herringbone Tweed Fabric
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
((SELECT id FROM products WHERE slug='herringbone-tweed-fabric'), 'https://images.pexels.com/photos/67624/pexels-photo-67624.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
((SELECT id FROM products WHERE slug='herringbone-tweed-fabric'), 'https://images.pexels.com/photos/67624/pexels-photo-67624.jpeg?auto=compress&cs=tinysrgb&w=800', 2);

-- ===== VARIANTS for Royal Check Wool Shawl =====
-- Variant Group: Size
INSERT INTO product_variant_groups (product_id, name, sort_order) VALUES
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), 'Size', 1);
INSERT INTO product_variant_values (group_id, value, sort_order) VALUES
((SELECT id FROM product_variant_groups WHERE product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl') AND name='Size'), '2 Meter', 1),
((SELECT id FROM product_variant_groups WHERE product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl') AND name='Size'), '3 Meter', 2);

-- Variant Group: Design
INSERT INTO product_variant_groups (product_id, name, sort_order) VALUES
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), 'Design', 2);
INSERT INTO product_variant_values (group_id, value, sort_order) VALUES
((SELECT id FROM product_variant_groups WHERE product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl') AND name='Design'), 'Royal Check', 1),
((SELECT id FROM product_variant_groups WHERE product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl') AND name='Design'), 'Scottish Plaid', 2);

-- Variant Images for Designs
INSERT INTO product_variant_images (product_id, variant_value_id, image_url, sort_order) VALUES
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), (SELECT id FROM product_variant_values WHERE value='Royal Check' AND group_id=(SELECT id FROM product_variant_groups WHERE name='Design' AND product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl'))), 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), (SELECT id FROM product_variant_values WHERE value='Royal Check' AND group_id=(SELECT id FROM product_variant_groups WHERE name='Design' AND product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl'))), 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), (SELECT id FROM product_variant_values WHERE value='Scottish Plaid' AND group_id=(SELECT id FROM product_variant_groups WHERE name='Design' AND product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl'))), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), (SELECT id FROM product_variant_values WHERE value='Scottish Plaid' AND group_id=(SELECT id FROM product_variant_groups WHERE name='Design' AND product_id=(SELECT id FROM products WHERE slug='royal-check-wool-shawl'))), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', 2);

-- Variant Combinations (2 sizes x 2 designs = 4 combos)
INSERT INTO product_variant_combinations (product_id, combination_key, regular_price, sale_price, stock_quantity, sku, status) VALUES
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), '2 Meter|Royal Check', 12000, 10800, 10, 'AMKS-RCW-2M-RC', 'active'),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), '2 Meter|Scottish Plaid', 12500, null, 8, 'AMKS-RCW-2M-SP', 'active'),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), '3 Meter|Royal Check', 14000, 12600, 12, 'AMKS-RCW-3M-RC', 'active'),
((SELECT id FROM products WHERE slug='royal-check-wool-shawl'), '3 Meter|Scottish Plaid', 14500, null, 10, 'AMKS-RCW-3M-SP', 'active');

-- Hero Banner
INSERT INTO hero_banners (title, subtitle, cta_text, cta_link, image_url, sort_order, is_visible) VALUES
('Timeless Elegance, Woven by Hand', 'Discover premium shawls and tweed fabric crafted for the discerning.', 'Shop Collection', '/shop', 'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=1920', 1, true),
('Heritage Tweed, Modern Silhouette', 'Bespoke tweed fabric for coats that tell a story.', 'Explore Tweed', '/category/tweed-fabric', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1920', 2, true)
ON CONFLICT DO NOTHING;

-- Homepage Sections
INSERT INTO homepage_sections (section_key, title, is_visible, sort_order) VALUES
('hero', 'Hero Banner', true, 1),
('featured_categories', 'Featured Categories', true, 2),
('featured_products', 'Featured Products', true, 3),
('new_arrivals', 'Newest Arrivals', true, 4),
('best_sellers', 'Best Sellers', true, 5),
('why_choose', 'Why Choose AMKS', true, 6),
('testimonials', 'Testimonials', true, 7),
('newsletter', 'Newsletter', true, 8)
ON CONFLICT DO NOTHING;

-- Sample Coupon
INSERT INTO coupons (code, discount_type, discount_value, expiry_date, minimum_purchase, is_enabled) VALUES
('WELCOME10', 'percentage', 10, '2027-12-31', 1000, true)
ON CONFLICT (code) DO NOTHING;
