import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Zap, Share2, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cart';
import { useRecentlyViewed } from '../store/recentlyViewed';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '../lib/utils';
import type { Product, ProductVariantGroup, ProductVariantCombination, ProductVariantImage, ProductImage } from '../types';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useRecentlyViewed((s) => s.addProduct);
  const recentlyViewedIds = useRecentlyViewed((s) => s.productIds);

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variantGroups, setVariantGroups] = useState<ProductVariantGroup[]>([]);
  const [combinations, setCombinations] = useState<ProductVariantCombination[]>([]);
  const [variantImages, setVariantImages] = useState<ProductVariantImage[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setActiveImage(0);
      setQuantity(1);
      setSelectedVariants({});
      const { data: prod } = await supabase.from('products').select('*, category:categories(*)').eq('slug', slug).maybeSingle();
      if (!prod) { setLoading(false); return; }
      const p = prod as Product;
      setProduct(p);
      addRecentlyViewed(p.id);

      const [imgRes, vgRes, comboRes, pviRes] = await Promise.all([
        supabase.from('product_images').select('*').eq('product_id', p.id).order('sort_order'),
        supabase.from('product_variant_groups').select('*, product_variant_values(*)').eq('product_id', p.id).order('sort_order'),
        supabase.from('product_variant_combinations').select('*').eq('product_id', p.id),
        supabase.from('product_variant_images').select('*').eq('product_id', p.id).order('sort_order'),
      ]);
      setImages((imgRes.data || []) as ProductImage[]);
      setVariantGroups((vgRes.data || []) as ProductVariantGroup[]);
      setCombinations((comboRes.data || []) as ProductVariantCombination[]);
      setVariantImages((pviRes.data || []) as ProductVariantImage[]);

      if (p.category_id) {
        const { data: relData } = await supabase.from('products').select('*, category:categories(*)').eq('category_id', p.category_id).eq('status', 'active').neq('id', p.id).limit(4);
        setRelated((relData || []) as Product[]);
      }

      if (recentlyViewedIds.length > 1) {
        const otherIds = recentlyViewedIds.filter((id) => id !== p.id);
        const { data: rvData } = await supabase.from('products').select('*, category:categories(*)').in('id', otherIds).eq('status', 'active').limit(4);
        setRecentlyViewed((rvData || []) as Product[]);
      }

      setLoading(false);
    })();
  }, [slug]);

  // Determine current display images based on selected variant (design/color)
  const displayImages = useMemo(() => {
    if (!product) return [];
    // Check if any variant group has variant images
    const groupWithImages = variantGroups.find((g) => {
      const selectedVal = selectedVariants[g.name];
      if (!selectedVal) return false;
      const valId = g.product_variant_values?.find((v) => v.value === selectedVal)?.id;
      return valId && variantImages.some((vi) => vi.variant_value_id === valId);
    });

    if (groupWithImages) {
      const selectedVal = selectedVariants[groupWithImages.name];
      const valId = groupWithImages.product_variant_values?.find((v) => v.value === selectedVal)?.id;
      const vImgs = variantImages.filter((vi) => vi.variant_value_id === valId).map((vi) => ({ id: vi.id, product_id: vi.product_id, image_url: vi.image_url, sort_order: vi.sort_order, created_at: vi.created_at }));
      if (vImgs.length > 0) return vImgs;
    }

    if (images.length > 0) return images;
    return product.featured_image ? [{ id: 'main', product_id: product.id, image_url: product.featured_image, sort_order: 0, created_at: '' }] : [];
  }, [product, images, variantGroups, variantImages, selectedVariants]);

  // Find matching combination
  const matchedCombination = useMemo(() => {
    if (!product?.has_variants || combinations.length === 0) return null;
    const allGroupsSelected = variantGroups.every((g) => selectedVariants[g.name]);
    if (!allGroupsSelected) return null;
    // Build key from selected values in group sort order
    const key = variantGroups
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((g) => selectedVariants[g.name])
      .join('|');
    return combinations.find((c) => c.combination_key === key) || null;
  }, [product, combinations, variantGroups, selectedVariants]);

  const currentPrice = useMemo(() => {
    if (matchedCombination) return getEffectivePrice(matchedCombination.regular_price, matchedCombination.sale_price);
    if (product) return getEffectivePrice(product.regular_price, product.sale_price);
    return 0;
  }, [matchedCombination, product]);

  const currentRegularPrice = matchedCombination?.regular_price || product?.regular_price || 0;
  const currentStock = matchedCombination?.stock_quantity ?? product?.stock_quantity ?? 0;
  const currentSku = matchedCombination?.sku || product?.sku || '';
  const discount = getDiscountPercent(currentRegularPrice, matchedCombination?.sale_price ?? product?.sale_price ?? null);

  const handleVariantSelect = (groupName: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [groupName]: value }));
    setActiveImage(0);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.has_variants && !matchedCombination) {
      toast.error('Please select all options.');
      return;
    }
    if (currentStock <= 0) {
      toast.error('This product is out of stock.');
      return;
    }
    const variantDesc = product.has_variants && matchedCombination
      ? Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')
      : null;
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      regular_price: currentRegularPrice,
      image_url: displayImages[0]?.image_url || product.featured_image || '',
      quantity,
      variant_combination_id: matchedCombination?.id || null,
      variant_description: variantDesc,
      sku: currentSku,
      stock: currentStock,
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-ink-400 text-sm">Loading product...</div>;
  }
  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400 mb-4">Product not found.</p>
        <Link to="/shop" className="btn-outline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="section-padding py-4 border-b border-ink-50">
        <nav className="flex items-center gap-2 text-xs text-ink-400">
          <Link to="/" className="hover:text-ink-900">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-ink-900">Shop</Link>
          {product.category && (<><ChevronRight className="w-3 h-3" /><Link to={`/category/${product.category.slug}`} className="hover:text-ink-900">{product.category.name}</Link></>)}
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-900">{product.name}</span>
        </nav>
      </div>

      {/* Product main */}
      <div className="section-padding py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
              className="relative aspect-[3/4] overflow-hidden bg-ink-50 mb-4 cursor-zoom-in"
              onClick={() => setZoomOpen(true)}
            >
              <img src={displayImages[activeImage]?.image_url || ''} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-ink-900 text-white text-xs tracking-widest uppercase px-3 py-1.5">
                  {discount}% Off
                </span>
              )}
            </motion.div>
            {displayImages.length > 1 && (
              <div className="flex gap-3">
                {displayImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-24 overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.image_url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && <p className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">{product.category.name}</p>}
            <h1 className="font-display text-3xl md:text-4xl font-light mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              {discount > 0 && <span className="text-lg text-ink-300 line-through">{formatPrice(currentRegularPrice)}</span>}
              <span className="text-2xl font-medium">{formatPrice(currentPrice)}</span>
            </div>

            {/* Stock + SKU */}
            <div className="flex items-center gap-4 mb-6 text-sm">
              <span className={`flex items-center gap-1.5 ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {currentStock > 0 ? <><Check className="w-4 h-4" /> In Stock ({currentStock})</> : 'Out of Stock'}
              </span>
              {currentSku && <span className="text-ink-400">SKU: {currentSku}</span>}
            </div>

            {product.short_description && (
              <p className="text-sm text-ink-500 leading-relaxed mb-6">{product.short_description}</p>
            )}

            {/* Variants */}
            {product.has_variants && variantGroups.map((group) => (
              <div key={group.id} className="mb-6">
                <h4 className="text-xs tracking-widest uppercase font-medium mb-3">{group.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {group.product_variant_values?.map((val) => (
                    <button
                      key={val.id}
                      onClick={() => handleVariantSelect(group.name, val.value)}
                      className={`px-4 py-2.5 text-sm border transition-all duration-300 ${
                        selectedVariants[group.name] === val.value
                          ? 'border-ink-900 bg-ink-900 text-white'
                          : 'border-ink-200 hover:border-ink-900'
                      }`}
                    >
                      {val.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-6">
              <h4 className="text-xs tracking-widest uppercase font-medium mb-3">Quantity</h4>
              <div className="flex items-center border border-ink-200 w-fit">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-ink-50 transition-colors" aria-label="Decrease quantity">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))} className="p-3 hover:bg-ink-50 transition-colors" aria-label="Increase quantity">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={currentStock <= 0} className="btn-primary flex-1">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={currentStock <= 0} className="btn-outline flex-1">
                <Zap className="w-4 h-4" /> Buy Now
              </button>
              <button onClick={handleShare} className="btn-outline !px-4" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Long description */}
            {product.long_description && (
              <div className="mb-6 pt-6 border-t border-ink-100">
                <h4 className="text-xs tracking-widest uppercase font-medium mb-3">Description</h4>
                <p className="text-sm text-ink-500 leading-relaxed whitespace-pre-line">{product.long_description}</p>
              </div>
            )}

            {/* Specifications */}
            <div className="pt-6 border-t border-ink-100">
              <h4 className="text-xs tracking-widest uppercase font-medium mb-4">Specifications</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {product.fabric_type && (<><dt className="text-ink-400">Fabric Type</dt><dd>{product.fabric_type}</dd></>)}
                {product.material && (<><dt className="text-ink-400">Material</dt><dd>{product.material}</dd></>)}
                {product.weight && (<><dt className="text-ink-400">Weight</dt><dd>{product.weight}g</dd></>)}
                {product.country_of_origin && (<><dt className="text-ink-400">Origin</dt><dd>{product.country_of_origin}</dd></>)}
                {product.brand && (<><dt className="text-ink-400">Brand</dt><dd>{product.brand}</dd></>)}
              </dl>
              {product.care_instructions && (
                <p className="text-sm text-ink-500 mt-4"><span className="text-ink-400">Care: </span>{product.care_instructions}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section-padding py-16 bg-stone-light">
          <h2 className="font-display text-3xl font-light text-center mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="section-padding py-16">
          <h2 className="font-display text-3xl font-light text-center mb-10">Recently Viewed</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {recentlyViewed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            className="fixed inset-0 bg-ink-900/90 z-[80] flex items-center justify-center p-8 cursor-zoom-out"
          >
            <img src={displayImages[activeImage]?.image_url || ''} alt={product.name} className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
