import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
      setCategory(cat as Category | null);
      if (cat) {
        const { data: prods } = await supabase.from('products').select('*, category:categories(*)').eq('category_id', (cat as Category).id).eq('status', 'active').order('created_at', { ascending: false });
        setProducts((prods || []) as Product[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="py-20 text-center text-ink-400 text-sm">Loading...</div>;
  if (!category) return (
    <div className="py-20 text-center">
      <p className="text-ink-400 mb-4">Category not found.</p>
      <Link to="/shop" className="btn-outline">Back to Shop</Link>
    </div>
  );

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img src={category.banner_image || ''} alt={category.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center text-white">
            <h1 className="font-display text-4xl md:text-6xl font-light mb-3">{category.name}</h1>
            {category.description && <p className="text-sm text-white/80 max-w-xl mx-auto">{category.description}</p>}
          </motion.div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="section-padding py-4 border-b border-ink-50">
        <nav className="flex items-center gap-2 text-xs text-ink-400">
          <Link to="/" className="hover:text-ink-900">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-ink-900">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-900">{category.name}</span>
        </nav>
      </div>

      {/* Products */}
      <div className="section-padding py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-400 text-sm">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
