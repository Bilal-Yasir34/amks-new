import { useEffect, useState, useMemo } from 'react';
<<<<<<< HEAD
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
=======
import { useSearchParams } from 'react-router-dom';
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
<<<<<<< HEAD
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const query = searchParams.get('q') || '';
<<<<<<< HEAD
  const categorySlug = slug || searchParams.get('category') || '';
=======
  const categorySlug = searchParams.get('category') || '';
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
  const sort = searchParams.get('sort') || 'newest';
  const maxPrice = searchParams.get('maxPrice') || '';
  const availability = searchParams.get('availability') || '';

<<<<<<< HEAD
  const [sliderVal, setSliderVal] = useState(maxPrice || '50000');

  useEffect(() => {
    setSliderVal(maxPrice || '50000');
  }, [maxPrice]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (sliderVal !== (maxPrice || '50000')) {
        updateParam('maxPrice', sliderVal === '50000' ? '' : sliderVal);
      }
    }, 150);
    return () => clearTimeout(delay);
  }, [sliderVal]);

=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: catData }, { data: prodData }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_visible', true).order('sort_order'),
        supabase.from('products').select('*, category:categories(*)').eq('status', 'active').eq('is_visible', true).order('created_at', { ascending: false }),
      ]);
      setCategories((catData || []) as Category[]);
      setProducts((prodData || []) as Product[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (query) {
<<<<<<< HEAD
      const q = query.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);
      result = result.filter((p) => {
        const name = p.name.toLowerCase();
        const desc = (p.short_description || '').toLowerCase();
        const longDesc = (p.long_description || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const catName = p.category?.name.toLowerCase() || '';

        return tokens.every((token) => {
          const stem = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
          const matchTarget = (text: string) => {
            return text.includes(token) || 
                   text.includes(stem) ||
                   (token.endsWith('s') && text.includes(token.slice(0, -1)));
          };
          return matchTarget(name) || matchTarget(desc) || matchTarget(longDesc) || matchTarget(sku) || matchTarget(catName);
        });
      });
=======
      const q = query.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.short_description || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q),
      );
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
    }
    if (categorySlug) {
      result = result.filter((p) => p.category?.slug === categorySlug);
    }
    if (maxPrice) {
      result = result.filter((p) => {
        const price = p.sale_price && p.sale_price < p.regular_price ? p.sale_price : p.regular_price;
        return price <= Number(maxPrice);
      });
    }
    if (availability === 'in_stock') {
      result = result.filter((p) => p.stock_quantity > 0);
    } else if (availability === 'out_of_stock') {
      result = result.filter((p) => p.stock_quantity <= 0);
    }

    switch (sort) {
      case 'oldest': result.reverse(); break;
      case 'price_low': result.sort((a, b) => (a.sale_price || a.regular_price) - (b.sale_price || b.regular_price)); break;
      case 'price_high': result.sort((a, b) => (b.sale_price || b.regular_price) - (a.sale_price || a.regular_price)); break;
      case 'best_selling': result.sort((a, b) => (b.homepage_section === 'best_seller' ? 1 : 0) - (a.homepage_section === 'best_seller' ? 1 : 0)); break;
    }

    return result;
  }, [products, query, categorySlug, maxPrice, availability, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [query, categorySlug, sort, maxPrice, availability]);

  const updateParam = (key: string, value: string) => {
<<<<<<< HEAD
    if (slug) {
      if (key === 'category') {
        if (value) {
          navigate(`/category/${value}`);
        } else {
          navigate('/shop');
        }
        return;
      }
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value); else next.delete(key);
      navigate(`/category/${slug}?${next.toString()}`);
      return;
    }

=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

<<<<<<< HEAD
  const activeCategory = categories.find((c) => c.slug === categorySlug);

=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs tracking-widest uppercase font-medium mb-4">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => updateParam('category', '')}
            className={`text-sm transition-colors ${!categorySlug ? 'text-ink-900 font-medium' : 'text-ink-400 hover:text-ink-900'}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.slug)}
              className={`block text-sm transition-colors ${categorySlug === c.slug ? 'text-ink-900 font-medium' : 'text-ink-400 hover:text-ink-900'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs tracking-widest uppercase font-medium mb-4">Price Range</h4>
        <input
          type="range"
          min="0"
          max="50000"
          step="1000"
<<<<<<< HEAD
          value={sliderVal}
          onChange={(e) => setSliderVal(e.target.value)}
          className="w-full accent-ink-900 cursor-pointer"
        />
        <p className="text-xs text-ink-400 mt-2">Max: Rs. {Number(sliderVal).toLocaleString()}</p>
=======
          value={maxPrice || '50000'}
          onChange={(e) => updateParam('maxPrice', e.target.value === '50000' ? '' : e.target.value)}
          className="w-full accent-ink-900"
        />
        <p className="text-xs text-ink-400 mt-2">Max: Rs. {Number(maxPrice || '50000').toLocaleString()}</p>
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
      </div>
      <div>
        <h4 className="text-xs tracking-widest uppercase font-medium mb-4">Availability</h4>
        <div className="space-y-2">
          {[
            { val: '', label: 'All' },
            { val: 'in_stock', label: 'In Stock' },
            { val: 'out_of_stock', label: 'Out of Stock' },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => updateParam('availability', opt.val)}
              className={`block text-sm transition-colors ${availability === opt.val ? 'text-ink-900 font-medium' : 'text-ink-400 hover:text-ink-900'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
<<<<<<< HEAD
      {activeCategory && activeCategory.banner_image ? (
        <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
          <img src={activeCategory.banner_image} alt={activeCategory.name} className="w-full h-full object-cover animate-fade-in" />
          <div className="absolute inset-0 bg-ink-900/40 animate-fade-in" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-6xl font-light mb-3">
              {activeCategory.name}
            </motion.h1>
            {activeCategory.description && <p className="text-sm text-white/80 max-w-xl mx-auto px-4 text-center">{activeCategory.description}</p>}
            <p className="text-xs tracking-wider text-white/60 mt-4">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</p>
          </div>
        </div>
      ) : (
        <div className="section-padding py-16 text-center bg-stone-light">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">
            {query ? `Results for "${query}"` : 'Shop All'}
          </motion.h1>
          <p className="text-sm text-ink-400 mt-3">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</p>
        </div>
      )}
=======
      <div className="section-padding py-16 text-center bg-stone-light">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">
          {query ? `Results for "${query}"` : categorySlug ? categories.find((c) => c.slug === categorySlug)?.name || 'Shop' : 'Shop All'}
        </motion.h1>
        <p className="text-sm text-ink-400 mt-3">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</p>
      </div>
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36

      <div className="section-padding py-12">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6">
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-60 shrink-0">
            <FilterPanel />
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-ink-100">
              <span className="text-xs text-ink-400 hidden sm:block">Sort by</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm bg-transparent border-none focus:outline-none cursor-pointer ml-auto"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="best_selling">Best Selling</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-[3/4] mb-4" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-ink-400 text-sm">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {paginated.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-ink-200 disabled:opacity-30 hover:border-ink-900 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 text-sm ${page === i + 1 ? 'bg-ink-900 text-white' : 'border border-ink-200 hover:border-ink-900'} transition-colors`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-ink-200 disabled:opacity-30 hover:border-ink-900 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-ink-900/50 z-50 lg:hidden" onClick={() => setShowFilters(false)} />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
          </motion.div>
        </>
      )}
    </div>
  );
}
