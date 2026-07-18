export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  thumbnail: string | null;
  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand: string | null;
  product_type: string | null;
  short_description: string | null;
  long_description: string | null;
  regular_price: number;
  sale_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  sku: string | null;
  weight: number | null;
  fabric_type: string | null;
  material: string | null;
  care_instructions: string | null;
  country_of_origin: string | null;
  featured_image: string | null;
  homepage_section: string;
  status: string;
  has_variants: boolean;
  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  is_visible: boolean;
  archived: boolean;
  publish_date: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  product_images?: ProductImage[];
}

export interface MediaAsset {
  id: string;
  url: string;
  file_name: string;
  file_path: string;
  content_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface CustomerSummary {
  customer_email: string;
  name: string;
  phone: string;
  total_orders: number;
  lifetime_spending: number;
  first_order_date: string;
  last_order_date: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariantGroup {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  product_variant_values?: ProductVariantValue[];
}

export interface ProductVariantValue {
  id: string;
  group_id: string;
  value: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariantCombination {
  id: string;
  product_id: string;
  combination_key: string;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  sku: string | null;
  weight: number | null;
  status: string;
  created_at: string;
}

export interface ProductVariantImage {
  id: string;
  product_id: string;
  variant_value_id: string | null;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  postal_code: string | null;
  order_notes: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_code: string | null;
  payment_method: string;
  payment_status: string;
  transaction_id: string | null;
  payment_screenshot: string | null;
  verification_notes: string | null;
  verified_by: string | null;
  verified_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_combination_id: string | null;
  variant_description: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  expiry_date: string | null;
  minimum_purchase: number;
  maximum_discount: number | null;
  usage_limit: number | null;
  one_time_use: boolean;
  is_enabled: boolean;
  created_at: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  video_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Settings {
  id: number;
  store_name: string;
  logo: string | null;
  favicon: string | null;
  contact_email: string;
  phone: string;
  address: string | null;
  social_links: Record<string, string>;
  footer_text: string | null;
  announcement_text: string;
  shipping_charge: number;
  free_shipping_threshold: number;
  currency: string;
  maintenance_mode: boolean;
  bank_name: string | null;
  bank_account_title: string | null;
  bank_account_number: string | null;
  bank_iban: string | null;
  bank_branch_code: string | null;
  payment_instructions: string | null;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  image_url: string;
  quantity: number;
  variant_combination_id: string | null;
  variant_description: string | null;
  sku: string | null;
  stock: number;
}
