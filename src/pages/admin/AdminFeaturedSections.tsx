import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flame, Plus, Trash2, Search, X, Check, ShieldAlert, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import type { Product } from '../../types';
import toast from 'react-hot-toast';

export default function AdminFeaturedSections() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state for adding products
  const [pickerModal, setPickerModal] = useState<{ open: boolean; section: 'featured' | 'best_seller' | null }>({
    open: false,
    section: null,
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*, parent:categories(*))')
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } else {
      setAllProducts((data || []) as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const featuredProducts = allProducts.filter((p) => p.homepage_section === 'featured');
  const bestSellerProducts = allProducts.filter((p) => p.homepage_section === 'best_seller');

  const MAX_LIMIT = 4;

  const setProductSection = async (product: Product, section: 'featured' | 'best_seller' | 'none') => {
    if (section === 'featured') {
      if (featuredProducts.length >= MAX_LIMIT && product.homepage_section !== 'featured') {
        toast.error(`Limit reached! Featured section cannot have more than ${MAX_LIMIT} products.`);
        return;
      }
    } else if (section === 'best_seller') {
      if (bestSellerProducts.length >= MAX_LIMIT && product.homepage_section !== 'best_seller') {
        toast.error(`Limit reached! Best Sellers section cannot have more than ${MAX_LIMIT} products.`);
        return;
      }
    }

    const { error } = await supabase
      .from('products')
      .update({ homepage_section: section })
      .eq('id', product.id);

    if (error) {
      toast.error('Failed to update product section.');
      console.error('Error updating section:', error);
    } else {
      if (section === 'none') {
        toast.success(`Removed "${product.name}" from homepage sections.`);
      } else {
        toast.success(`Added "${product.name}" to ${section === 'featured' ? 'Featured Products' : 'Best Sellers'}.`);
      }
      loadProducts();
    }
  };

  const filteredSearchProducts = allProducts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.category?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
          <h1 className="font-display text-3xl font-light">Homepage Showcase Sections</h1>
        </div>
        <p className="text-xs text-ink-400">
          Manage products displayed in the <strong>Featured Products</strong> and <strong>Best Sellers</strong> sections on your homepage. Maximum 4 products per section.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-400 py-8">Loading showcase sections...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Products Box */}
          <div className="bg-white border border-ink-200 rounded-sm overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-4 bg-stone-light/50 border-b border-ink-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="font-semibold text-base text-ink-900">Featured Products</h2>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    featuredProducts.length >= MAX_LIMIT ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-ink-700'
                  }`}
                >
                  {featuredProducts.length} / {MAX_LIMIT} Products
                </span>
              </div>

              <div className="p-4">
                {featuredProducts.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-ink-200 rounded bg-stone-50/50">
                    <Star className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                    <p className="text-xs text-ink-500 font-medium">No featured products added yet.</p>
                    <p className="text-[11px] text-ink-400 mt-1">Add up to 4 products to feature on homepage.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {featuredProducts.map((p) => (
                      <div key={p.id} className="border border-ink-200 p-3 rounded bg-white flex items-start justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {p.featured_image ? (
                            <img src={p.featured_image} alt="" className="w-12 h-14 object-cover rounded bg-stone-100 shrink-0 border border-ink-100" />
                          ) : (
                            <div className="w-12 h-14 bg-stone-100 rounded shrink-0 flex items-center justify-center text-ink-300 text-xs">No img</div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-ink-900 truncate">{p.name}</h3>
                            <p className="text-[10px] text-ink-400 truncate">{p.category?.name || 'No category'}</p>
                            <p className="text-xs font-medium text-ink-800 mt-0.5">{formatPrice(p.sale_price || p.regular_price)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setProductSection(p, 'none')}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0 transition-colors"
                          title="Remove from Featured"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-ink-100 bg-stone-50/50">
              <button
                onClick={() => setPickerModal({ open: true, section: 'featured' })}
                disabled={featuredProducts.length >= MAX_LIMIT}
                className="w-full btn-primary !py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {featuredProducts.length >= MAX_LIMIT ? 'Limit Reached (4/4 Max)' : 'Add Product to Featured'}
              </button>
            </div>
          </div>

          {/* Best Sellers Box */}
          <div className="bg-white border border-ink-200 rounded-sm overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-4 bg-stone-light/50 border-b border-ink-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <h2 className="font-semibold text-base text-ink-900">Best Sellers</h2>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    bestSellerProducts.length >= MAX_LIMIT ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-stone-200 text-ink-700'
                  }`}
                >
                  {bestSellerProducts.length} / {MAX_LIMIT} Products
                </span>
              </div>

              <div className="p-4">
                {bestSellerProducts.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-ink-200 rounded bg-stone-50/50">
                    <Flame className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                    <p className="text-xs text-ink-500 font-medium">No best sellers added yet.</p>
                    <p className="text-[11px] text-ink-400 mt-1">Add up to 4 best seller products for homepage showcase.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bestSellerProducts.map((p) => (
                      <div key={p.id} className="border border-ink-200 p-3 rounded bg-white flex items-start justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {p.featured_image ? (
                            <img src={p.featured_image} alt="" className="w-12 h-14 object-cover rounded bg-stone-100 shrink-0 border border-ink-100" />
                          ) : (
                            <div className="w-12 h-14 bg-stone-100 rounded shrink-0 flex items-center justify-center text-ink-300 text-xs">No img</div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-ink-900 truncate">{p.name}</h3>
                            <p className="text-[10px] text-ink-400 truncate">{p.category?.name || 'No category'}</p>
                            <p className="text-xs font-medium text-ink-800 mt-0.5">{formatPrice(p.sale_price || p.regular_price)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setProductSection(p, 'none')}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0 transition-colors"
                          title="Remove from Best Sellers"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-ink-100 bg-stone-50/50">
              <button
                onClick={() => setPickerModal({ open: true, section: 'best_seller' })}
                disabled={bestSellerProducts.length >= MAX_LIMIT}
                className="w-full btn-primary !py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {bestSellerProducts.length >= MAX_LIMIT ? 'Limit Reached (4/4 Max)' : 'Add Product to Best Sellers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick All Products Management Table */}
      <div className="bg-white border border-ink-200 rounded-sm shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-ink-600" /> Quick Section Manager
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">Click on Star or Flame icons to quickly add/remove products from homepage sections</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-ink-200 rounded focus:border-ink-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-ink-100 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-light text-ink-500 uppercase tracking-wider font-medium text-[11px] border-b border-ink-100">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3 text-center">Featured (Max 4)</th>
                <th className="p-3 text-center">Best Seller (Max 4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredSearchProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-ink-400">
                    No products matching search.
                  </td>
                </tr>
              ) : (
                filteredSearchProducts.map((p) => {
                  const isFeatured = p.homepage_section === 'featured';
                  const isBestSeller = p.homepage_section === 'best_seller';

                  return (
                    <tr key={p.id} className="hover:bg-stone-light/40 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-3">
                          {p.featured_image ? (
                            <img src={p.featured_image} alt="" className="w-9 h-11 object-cover rounded bg-stone-100 shrink-0 border" />
                          ) : (
                            <div className="w-9 h-11 bg-stone-100 rounded shrink-0 flex items-center justify-center text-[10px] text-ink-300">No img</div>
                          )}
                          <div>
                            <p className="text-ink-900 font-semibold">{p.name}</p>
                            <p className="text-[10px] text-ink-400">{p.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-ink-600">{p.category?.name || '—'}</td>
                      <td className="p-3 text-ink-900 font-medium">{formatPrice(p.sale_price || p.regular_price)}</td>
                      
                      {/* Featured Star Toggle */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setProductSection(p, isFeatured ? 'none' : 'featured')}
                          disabled={!isFeatured && featuredProducts.length >= MAX_LIMIT}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isFeatured
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-stone-100 text-ink-600 hover:bg-amber-100 hover:text-amber-800 disabled:opacity-40 disabled:hover:bg-stone-100 disabled:hover:text-ink-600'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-white' : ''}`} />
                          {isFeatured ? 'Featured' : 'Add Star'}
                        </button>
                      </td>

                      {/* Best Seller Flame Toggle */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setProductSection(p, isBestSeller ? 'none' : 'best_seller')}
                          disabled={!isBestSeller && bestSellerProducts.length >= MAX_LIMIT}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isBestSeller
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-stone-100 text-ink-600 hover:bg-orange-100 hover:text-orange-800 disabled:opacity-40 disabled:hover:bg-stone-100 disabled:hover:text-ink-600'
                          }`}
                        >
                          <Flame className={`w-3.5 h-3.5 ${isBestSeller ? 'fill-white' : ''}`} />
                          {isBestSeller ? 'Best Seller' : 'Add Flame'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {pickerModal.open && pickerModal.section && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPickerModal({ open: false, section: null })} className="fixed inset-0 bg-ink-900/50 z-[80]" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white z-[90] rounded shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-ink-100 bg-stone-light">
                <div className="flex items-center gap-2">
                  {pickerModal.section === 'featured' ? (
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  )}
                  <h2 className="font-semibold text-sm">
                    Add Product to {pickerModal.section === 'featured' ? 'Featured Products' : 'Best Sellers'}
                  </h2>
                </div>
                <button onClick={() => setPickerModal({ open: false, section: null })}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-ink-500">Select a product to display in this homepage section (Max 4):</p>
                <div className="space-y-2">
                  {allProducts
                    .filter((p) => p.homepage_section !== pickerModal.section)
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 border border-ink-100 rounded hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {p.featured_image ? (
                            <img src={p.featured_image} alt="" className="w-10 h-12 object-cover rounded bg-stone-100 border" />
                          ) : (
                            <div className="w-10 h-12 bg-stone-100 rounded flex items-center justify-center text-[10px] text-ink-300">No img</div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-ink-900">{p.name}</p>
                            <p className="text-[10px] text-ink-400">{p.category?.name || 'Uncategorized'}</p>
                            <p className="text-xs text-ink-700 font-medium">{formatPrice(p.sale_price || p.regular_price)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setProductSection(p, pickerModal.section!);
                            setPickerModal({ open: false, section: null });
                          }}
                          className="btn-primary !py-1.5 !px-3 text-xs"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
