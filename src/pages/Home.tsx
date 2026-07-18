import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category, HeroBanner } from '../types';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

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

  const defaultBanners: HeroBanner[] = [
    {
      id: 'default-1',
      title: 'Timeless Elegance, Woven by Hand',
      subtitle: 'Discover premium shawls and tweed fabric crafted for the discerning.',
      cta_text: 'Shop Collection',
      cta_link: '/shop',
      image_url: 'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=1920',
      is_visible: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'default-2',
      title: 'Heritage Tweed, Modern Silhouette',
      subtitle: 'Bespoke tweed fabric for coats that tell a story.',
      cta_text: 'Explore Tweed',
      cta_link: '/category/tweed-fabric',
      image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1920',
      is_visible: true,
      sort_order: 2,
      created_at: new Date().toISOString()
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % displayBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  if (loading) {
    return <Loader text="Welcome to AMKS" />;
  }

  return (
    <div>
      {/* Hero */}
      {displayBanners.length > 0 && (
        <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
          {displayBanners.map((banner, i) => (
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
                      key={`title-${i}-${activeBanner}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: i === activeBanner ? 1 : 0, y: i === activeBanner ? 0 : 30 }}
                      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light leading-tight mb-4"
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p
                      key={`sub-${i}-${activeBanner}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: i === activeBanner ? 1 : 0, y: i === activeBanner ? 0 : 30 }}
                      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed"
                    >
                      {banner.subtitle}
                    </motion.p>
                    {banner.cta_text && (
                      <motion.div
                        key={`cta-${i}-${activeBanner}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: i === activeBanner ? 1 : 0, y: i === activeBanner ? 0 : 30 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={banner.cta_link || '/shop'}
                          className="inline-flex items-center gap-2 bg-white text-ink-900 border border-white px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-transparent hover:text-white hover:tracking-[0.2em] transition-all duration-500 ease-luxury group"
                        >
                          {banner.cta_text}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Dots */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {displayBanners.map((_, i) => (
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
          <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-8 pb-4">
            {featured.map((p, i) => (
              <div key={p.id} className="min-w-[70%] sm:min-w-[45%] shrink-0 snap-start lg:min-w-0 lg:shrink lg:snap-none">
                <ProductCard product={p} index={i} />
              </div>
            ))}
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
        <div className="overflow-hidden relative -mx-4 px-4 md:-mx-12 md:px-12">
          {/* Fading luxury edge filters */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6 md:gap-8"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{ width: 'fit-content' }}
          >
            {[
              { icon: Award, title: 'Luxury Quality', desc: 'Each piece is crafted with the finest materials and meticulous attention to detail.' },
              { icon: Sparkles, title: 'Premium Fabrics', desc: 'Sourced from the world\'s best mills — Cashmere, Merino wool, and authentic tweed.' },
              { icon: Truck, title: 'Nationwide Delivery', desc: 'Free shipping on all orders nationwide. Delivered with care to your doorstep.' },
              { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Cash on delivery and bank transfer options. Your data is always protected.' },
            ].concat([
              { icon: Award, title: 'Luxury Quality', desc: 'Each piece is crafted with the finest materials and meticulous attention to detail.' },
              { icon: Sparkles, title: 'Premium Fabrics', desc: 'Sourced from the world\'s best mills — Cashmere, Merino wool, and authentic tweed.' },
              { icon: Truck, title: 'Nationwide Delivery', desc: 'Free shipping on all orders nationwide. Delivered with care to your doorstep.' },
              { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Cash on delivery and bank transfer options. Your data is always protected.' },
            ]).map((item, i) => (
              <div
                key={i}
                className="w-[280px] md:w-[320px] shrink-0 text-center group bg-stone-light/30 border border-ink-100/50 p-8 flex flex-col items-center hover:bg-stone-light/50 transition-all duration-300 whitespace-normal"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-5 bg-white border border-ink-100 group-hover:border-ink-900 transition-colors duration-500 rounded-full shadow-sm">
                  <item.icon className="w-7 h-7 text-ink-700 group-hover:text-ink-900 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-3 text-ink-900">{item.title}</h3>
                <p className="text-xs text-ink-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding py-20 bg-ink-900 text-white">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Testimonials</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Words From Our Clients</motion.h2>
        </div>
        <div className="flex flex-col space-y-16 max-w-4xl mx-auto relative px-4 md:px-0">
          {[
            { quote: 'The premium shawl exceeded all expectations. The craftsmanship is simply unparalleled.', name: 'Mehmood Zahid.', role: 'Lahore' },
            { quote: 'I ordered tweed fabric for a waist coat. The quality is world-class. Highly recommend AMKS.', name: 'Hassan M.', role: 'Karachi' },
            { quote: 'Premium quality, elegant packaging, and fast delivery. AMKS has become my go-to for luxury textiles.', name: 'Saleem Khan.', role: 'Islamabad' },
          ].map((t, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col max-w-xl w-full ${isLeft ? 'self-start text-left' : 'self-end text-right'}`}
              >
                <p className="font-display text-2xl md:text-3xl font-light italic leading-relaxed mb-4 text-white/90">
                  "{t.quote}"
                </p>
                <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                  <span className="text-sm font-medium tracking-wider text-white">{t.name}</span>
                  <span className="text-xs text-ink-400 tracking-widest uppercase mt-0.5">{t.role}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Our Heritage About Section */}
      <section className="section-padding py-24 bg-stone-light/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Text and Secondary Image */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-ink-400 block mb-3">Our Heritage</span>
              <h2 className="font-display text-4xl md:text-5xl font-light text-ink-900 leading-tight">
                Pure Wool,<br />Pure Luxury
              </h2>
              <p className="text-sm text-ink-500 mt-6 leading-relaxed">
                At AMKS, we believe that true luxury lies in the texture of our stories. Each thread of our pure wool shawls and tweed fabrics is selected from premium mills and hand-inspected to guarantee timeless warmth, bespoke tailoring, and heritage craft.
              </p>
              <p className="text-sm text-ink-500 mt-4 leading-relaxed">
                From the classic drape of raw wool to the structured fit of heritage tweed, we design for the discerning customer who values substance and authenticity.
              </p>
            </div>
            <div className="overflow-hidden border border-ink-100/50 shadow-sm group">
              <img
                src="/images/about3.png"
                alt="Tweed Fabric Desk Flatlay"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Right Staggered Images */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6 relative">
            <div className="space-y-4 md:space-y-6">
              <div className="overflow-hidden border border-ink-100/50 shadow-sm group">
                <img
                  src="/images/about1.png"
                  alt="Pure Wool Shawl Model"
                  className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="space-y-4 md:space-y-6 pt-12">
              <div className="overflow-hidden border border-ink-100/50 shadow-sm group">
                <img
                  src="/images/about2.png"
                  alt="Shawl Draped over Chair"
                  className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

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
    </div>
  );
}
