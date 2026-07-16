import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category, HeroBanner } from '../types';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: bannersData }, { data: catData }, { data: featuredData }, { data: newArrivalsData }, { data: bestSellersData }] = await Promise.all([
        supabase.from('hero_banners').select('*').eq('is_visible', true).order('sort_order'),
        supabase.from('categories').select('*').eq('is_visible', true).order('sort_order'),
        supabase.from('products').select('*, category:categories(*)').eq('homepage_section', 'featured').eq('status', 'active').limit(4),
        supabase.from('products').select('*, category:categories(*)').eq('homepage_section', 'new_arrival').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
        supabase.from('products').select('*, category:categories(*)').eq('homepage_section', 'best_seller').eq('status', 'active').limit(4),
      ]);
      setBanners((bannersData || []) as HeroBanner[]);
      setCategories((catData || []) as Category[]);
      setFeatured((featuredData || []) as Product[]);
      setNewArrivals((newArrivalsData || []) as Product[]);
      setBestSellers((bestSellersData || []) as Product[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div>
      {/* Hero */}
      {banners.length > 0 && (
        <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={false}
              animate={{ opacity: i === activeBanner ? 1 : 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={banner.image_url || ''}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="section-padding w-full">
                  <div className="max-w-2xl">
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: i === activeBanner ? 1 : 0, y: i === activeBanner ? 0 : 30 }}
                      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light leading-tight mb-4"
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: i === activeBanner ? 1 : 0, y: i === activeBanner ? 0 : 30 }}
                      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed"
                    >
                      {banner.subtitle}
                    </motion.p>
                    {banner.cta_text && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: i === activeBanner ? 1 : 0, y: i === activeBanner ? 0 : 30 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={banner.cta_link || '/shop'}
                          className="inline-flex items-center gap-2 bg-white text-ink-900 px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-ink-100 transition-all duration-500 ease-luxury group"
                        >
                          {banner.cta_text}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={`h-1 transition-all duration-500 ${i === activeBanner ? 'w-12 bg-white' : 'w-6 bg-white/40'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Categories */}
      <section className="section-padding py-20">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3"
          >
            Collections
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl font-light"
          >
            Featured Categories
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/category/${cat.slug}`} className="group relative block overflow-hidden aspect-[16/10]">
                <img
                  src={cat.banner_image || cat.thumbnail || ''}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-display text-3xl text-white font-light mb-1">{cat.name}</h3>
                  <p className="text-sm text-white/70 mb-3 line-clamp-1">{cat.description}</p>
                  <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white group-hover:gap-3 transition-all duration-300">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section-padding py-20 bg-stone-light">
          <div className="text-center mb-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Curated Selection</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Featured Products</motion.h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section-padding py-20">
          <div className="text-center mb-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Just Arrived</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Newest Arrivals</motion.h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="section-padding py-20 bg-stone-light">
          <div className="text-center mb-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Customer Favorites</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Best Sellers</motion.h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Why Choose AMKS */}
      <section className="section-padding py-20">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">The AMKS Promise</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Why Choose AMKS</motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Award, title: 'Luxury Quality', desc: 'Each piece is crafted with the finest materials and meticulous attention to detail.' },
            { icon: Sparkles, title: 'Premium Fabrics', desc: 'Sourced from the world\'s best mills — Cashmere, Merino wool, and authentic tweed.' },
            { icon: Truck, title: 'Nationwide Delivery', desc: 'Free shipping on all orders nationwide. Delivered with care to your doorstep.' },
            { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Cash on delivery and bank transfer options. Your data is always protected.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-5 border border-ink-200 group-hover:border-ink-900 transition-colors duration-500">
                <item.icon className="w-7 h-7 text-ink-700 group-hover:text-ink-900 transition-colors" />
              </div>
              <h3 className="text-sm font-medium tracking-wider uppercase mb-3">{item.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding py-20 bg-ink-900 text-white">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Testimonials</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Words From Our Clients</motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { quote: 'The Kashmir shawl exceeded all expectations. The craftsmanship is simply unparalleled.', name: 'Ayesha K.', role: 'Lahore' },
            { quote: 'I ordered tweed fabric for a bespoke coat. The quality is world-class. Highly recommend AMKS.', name: 'Hassan M.', role: 'Karachi' },
            { quote: 'Premium quality, elegant packaging, and fast delivery. AMKS has become my go-to for luxury textiles.', name: 'Fatima R.', role: 'Islamabad' },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center"
            >
              <p className="font-display text-xl font-light italic leading-relaxed mb-6 text-white/90">"{t.quote}"</p>
              <p className="text-sm font-medium tracking-wider">{t.name}</p>
              <p className="text-xs text-ink-400 tracking-wider">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="section-padding py-20">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">@amks.pk</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Follow Our Journey</motion.h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/631139/pexels-photo-631139.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/67624/pexels-photo-67624.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/631107/pexels-photo-631107.jpeg?auto=compress&cs=tinysrgb&w=400',
          ].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="aspect-square overflow-hidden group cursor-pointer"
            >
              <img src={img} alt="Instagram" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </motion.div>
          ))}
        </div>
      </section>

      {loading && <div className="py-20 text-center text-ink-400 text-sm">Loading...</div>}
    </div>
  );
}
