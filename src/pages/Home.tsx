import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Sparkles, Award, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category, HeroBanner } from '../types';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const MasterCardLogo = () => (
  <div className="flex -space-x-1.5 items-center shrink-0">
    <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-90" />
    <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90" />
  </div>
);

const VisaLogo = () => (
  <span className="font-sans italic font-extrabold text-[#1A1F71] tracking-tight text-sm shrink-0">VISA</span>
);

const EasypaisaLogo = () => (
  <span className="font-sans font-bold text-[#00A859] tracking-tighter text-xs shrink-0">easy<span className="text-[#39B54A]">paisa</span></span>
);

const JazzCashLogo = () => (
  <span className="font-sans font-extrabold text-[#FFCC00] bg-black px-1.5 py-0.5 rounded text-[8px] tracking-wider shrink-0">JAZZ<span className="text-white">CASH</span></span>
);

const getSocialLink = (url: string | null | undefined, fallback: string) => {
  if (!url || url.trim() === '' || url.trim() === '#') return fallback;
  return url;
};

export default function Home() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: bannersData }, { data: catData }, { data: featuredData }, { data: newArrivalsData }, { data: bestSellersData }, { data: settingsData }] = await Promise.all([
        supabase.from('hero_banners').select('*').eq('is_visible', true).order('sort_order'),
        supabase.from('categories').select('*').eq('is_visible', true).order('sort_order'),
        supabase.from('products').select('*, category:categories(*)').eq('homepage_section', 'featured').eq('status', 'active').limit(4),
        supabase.from('products').select('*, category:categories(*)').eq('homepage_section', 'new_arrival').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
        supabase.from('products').select('*, category:categories(*)').eq('homepage_section', 'best_seller').eq('status', 'active').limit(4),
        supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
      ]);
      setBanners((bannersData || []) as HeroBanner[]);
      setCategories((catData || []) as Category[]);
      setFeatured((featuredData || []) as Product[]);
      setNewArrivals((newArrivalsData || []) as Product[]);
      setBestSellers((bestSellersData || []) as Product[]);
      setSettings(settingsData);
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

  const testimonials = [
    { quote: 'The premium shawl exceeded all expectations. The craftsmanship is simply unparalleled.', name: 'Mehmood Zahid.', role: 'Lahore' },
    { quote: 'I ordered tweed fabric for a waist coat. The quality is world-class. Highly recommend AMKS.', name: 'Hassan M.', role: 'Karachi' },
    { quote: 'Premium quality, elegant packaging, and fast delivery. AMKS has become my go-to for luxury textiles.', name: 'Saleem Khan.', role: 'Islamabad' },
  ];

  const defaultInstagramImages = [
    'https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/631139/pexels-photo-631139.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/67624/pexels-photo-67624.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/631107/pexels-photo-631107.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  const instagramImages = [1, 2, 3, 4, 5, 6].map((num) => {
    return settings?.social_links?.[`instagram_image_${num}`] || defaultInstagramImages[num - 1];
  });

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
              style={{
                pointerEvents: i === activeBanner ? 'auto' : 'none',
                zIndex: i === activeBanner ? 10 : 0
              }}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
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
      <section className="section-padding py-16 bg-ink-900 text-white relative overflow-hidden">
        {/* Background Decorative Quote Sign */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <Quote className="w-64 h-64 text-white/[0.02]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Testimonials</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-3xl md:text-4xl font-light">Words From Our Clients</motion.h2>
          </div>

          <div className="w-full min-h-[140px] md:min-h-[110px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="text-center px-4"
              >
                <p className="font-display text-lg md:text-xl lg:text-2xl font-light italic leading-relaxed text-white/90 max-w-3xl mx-auto">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-sm font-semibold tracking-[0.15em] text-white">
                    {testimonials[activeTestimonial].name}
                  </span>
                  <span className="text-[10px] text-ink-400 tracking-[0.25em] uppercase mt-1">
                    {testimonials[activeTestimonial].role}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="w-10 h-10 border border-white/10 hover:border-white/40 flex items-center justify-center transition-colors duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1 transition-all duration-300 ${i === activeTestimonial ? 'w-8 bg-white' : 'w-3 bg-white/20'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="w-10 h-10 border border-white/10 hover:border-white/40 flex items-center justify-center transition-colors duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </section>

      {/* Payment Ticker */}
      <section className="border-b border-ink-100 bg-[#fafaf9] py-8 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 mb-5 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-semibold">Accepted Payment Methods</p>
        </div>
        <div className="relative w-full overflow-hidden">
          {/* Fading luxury edge filters */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#fafaf9] via-[#fafaf9]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#fafaf9] via-[#fafaf9]/80 to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-12 md:gap-16 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{ width: 'fit-content' }}
          >
            {Array(6).fill([
              { name: 'Mastercard', logo: <MasterCardLogo /> },
              { name: 'Visa', logo: <VisaLogo /> },
              { name: 'Easypaisa', logo: <EasypaisaLogo /> },
              { name: 'JazzCash', logo: <JazzCashLogo /> },
            ]).flat().map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0 bg-white border border-ink-100/50 px-5 py-2.5 rounded shadow-sm hover:border-ink-400 transition-colors duration-300">
                {item.logo}
                <span className="text-[10px] tracking-widest uppercase font-medium text-ink-600">{item.name}</span>
              </div>
            ))}
          </motion.div>
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
          {instagramImages.map((img, i) => (
            <a
              key={i}
              href={getSocialLink(settings?.social_links?.instagram, "https://www.instagram.com/fabric_and_shawal_by_amks.pk/")}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="aspect-square overflow-hidden group cursor-pointer"
              >
                <img src={img} alt="Instagram" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </motion.div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
