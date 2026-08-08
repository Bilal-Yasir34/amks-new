import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, ArrowLeft, FolderTree, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<(Category & { product_count?: number })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setParentCategory(null);
      setSubcategories([]);
      setProducts([]);

      // Fetch target category
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
      const currentCat = cat as Category | null;
      setCategory(currentCat);

      if (currentCat) {
        if (currentCat.parent_id) {
          // --- CASE A: SUB-CATEGORY PAGE ---
          // Fetch parent category for breadcrumbs & back link
          const { data: pCat } = await supabase.from('categories').select('*').eq('id', currentCat.parent_id).maybeSingle();
          setParentCategory(pCat as Category | null);

          // Fetch products belonging specifically to this subcategory
          const { data: prods } = await supabase
            .from('products')
            .select('*, category:categories(*, parent:categories(*))')
            .eq('category_id', currentCat.id)
            .eq('status', 'active')
            .eq('is_visible', true)
            .order('created_at', { ascending: false });

          setProducts((prods || []) as Product[]);
        } else {
          // --- CASE B: PARENT CATEGORY PAGE ---
          // Fetch child subcategories
          const { data: subs } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', currentCat.id)
            .eq('is_visible', true)
            .order('sort_order');

          const childSubs = (subs || []) as Category[];

          if (childSubs.length > 0) {
            // Fetch product counts for each subcategory
            const subcatIds = childSubs.map((s) => s.id);
            const { data: allProds } = await supabase
              .from('products')
              .select('id, category_id')
              .in('category_id', subcatIds)
              .eq('status', 'active')
              .eq('is_visible', true);

            const fetchedProds = (allProds || []) as { id: string; category_id: string }[];

            const withCounts = childSubs.map((s) => ({
              ...s,
              product_count: fetchedProds.filter((p) => p.category_id === s.id).length,
            }));

            setSubcategories(withCounts);
          } else {
            // If parent category has NO subcategories, fetch products directly in this parent category
            const { data: prods } = await supabase
              .from('products')
              .select('*, category:categories(*, parent:categories(*))')
              .eq('category_id', currentCat.id)
              .eq('status', 'active')
              .eq('is_visible', true)
              .order('created_at', { ascending: false });

            setProducts((prods || []) as Product[]);
          }
        }
      }

      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="py-20 text-center text-ink-400 text-sm font-medium">Loading category...</div>;
  if (!category)
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400 mb-4">Category not found.</p>
        <Link to="/shop" className="btn-outline">
          Back to Shop
        </Link>
      </div>
    );

  const isParentWithSubcategories = !category.parent_id && subcategories.length > 0;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[36vh] min-h-[260px] overflow-hidden">
        <img
          src={
            category.banner_image ||
            category.thumbnail ||
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80'
          }
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink-900/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center text-white px-4">
            <span className="text-[10px] tracking-[0.3em] uppercase bg-white/20 backdrop-blur-xs px-3 py-1 font-mono rounded-full mb-3 inline-block">
              {!category.parent_id ? 'Main Category' : 'Sub-Category'}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-3">{category.name}</h1>
            {category.description && <p className="text-sm text-white/80 max-w-xl mx-auto">{category.description}</p>}
          </motion.div>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="section-padding py-4 border-b border-ink-100 bg-stone-light/30 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-ink-400">
          <Link to="/" className="hover:text-ink-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-ink-900">
            Shop
          </Link>
          {parentCategory && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/category/${parentCategory.slug}`} className="hover:text-ink-900 font-medium">
                {parentCategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-900 font-semibold">{category.name}</span>
        </nav>

        {parentCategory && (
          <Link
            to={`/category/${parentCategory.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {parentCategory.name}
          </Link>
        )}
      </div>

      {/* MAIN RENDER LOGIC */}
      {isParentWithSubcategories ? (
        /* ========================================================================= */
        /* MODE 1: PARENT CATEGORY PAGE (ONLY SHOW SUB-CATEGORIES CARDS - NO PRODUCTS) */
        /* ========================================================================= */
        <div className="section-padding py-16 bg-stone-light/20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-ink-400 block mb-2 font-medium">Browse Collections</span>
            <h2 className="font-display text-3xl md:text-4xl font-light text-ink-900">Sub-Categories in {category.name}</h2>
            <p className="text-xs text-ink-500 mt-2">Select a sub-category below to explore its specific products.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {subcategories.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-white border border-ink-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <Link to={`/category/${sub.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-stone-100">
                  {sub.banner_image || sub.thumbnail ? (
                    <img
                      src={sub.banner_image || sub.thumbnail || ''}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxury"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-ink-400">
                      <FolderTree className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-[11px] font-medium tracking-wider uppercase bg-white/20 backdrop-blur-xs px-3 py-0.5 rounded-full">
                      {sub.product_count || 0} Products
                    </span>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-medium text-ink-900 mb-2 group-hover:text-ink-600 transition-colors">
                      <Link to={`/category/${sub.slug}`}>{sub.name}</Link>
                    </h3>
                    {sub.description ? (
                      <p className="text-xs text-ink-500 line-clamp-2 mb-6 leading-relaxed">{sub.description}</p>
                    ) : (
                      <p className="text-xs text-ink-400 italic mb-6">Discover our exclusive {sub.name} collection.</p>
                    )}
                  </div>

                  <Link
                    to={`/category/${sub.slug}`}
                    className="btn-primary w-full text-xs tracking-widest uppercase flex items-center justify-center gap-2 group-hover:bg-ink-800 transition-colors"
                  >
                    Open {sub.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: SUB-CATEGORY PAGE (SHOW PRODUCTS IN THIS SUB-CATEGORY)            */
        /* ========================================================================= */
        <div className="section-padding py-12">
          <div className="flex justify-between items-center mb-8 border-b border-ink-100 pb-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-light text-ink-900">{category.name} Collection</h2>
              <p className="text-xs text-ink-400 mt-1">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'} in {category.name}
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 border border-dashed border-ink-200 rounded max-w-xl mx-auto">
              <Tag className="w-8 h-8 text-ink-300 mx-auto mb-2" />
              <p className="text-ink-600 text-sm font-medium">No products in {category.name} yet.</p>
              <p className="text-xs text-ink-400 mt-1 mb-4">Check back soon or explore other sub-categories.</p>
              {parentCategory && (
                <Link to={`/category/${parentCategory.slug}`} className="btn-outline text-xs">
                  Back to {parentCategory.name}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
