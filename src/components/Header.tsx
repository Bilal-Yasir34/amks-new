import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { supabase } from '../lib/supabase';
import type { Settings, Product } from '../types';
import { formatPrice } from '../lib/utils';
=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [liveResults, setLiveResults] = useState<Product[]>([]);
=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { user } = useAuth();
<<<<<<< HEAD
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as Settings);
    });
  }, []);
=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
<<<<<<< HEAD
    setLiveResults([]);
  }, [location.pathname]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setLiveResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const tokens = q.split(/\s+/).filter(Boolean);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('status', 'active')
        .eq('is_visible', true)
        .limit(30);

      if (data) {
        const filtered = (data as any[]).filter((p) => {
          const name = p.name.toLowerCase();
          const desc = (p.short_description || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          const catName = p.category?.name.toLowerCase() || '';

          return tokens.every((token) => {
            const stem = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
            const matchTarget = (text: string) => {
              return text.includes(token) || 
                     text.includes(stem) ||
                     (token.endsWith('s') && text.includes(token.slice(0, -1)));
            };
            return matchTarget(name) || matchTarget(desc) || matchTarget(sku) || matchTarget(catName);
          });
        });
        setLiveResults(filtered.slice(0, 5));
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [searchQuery]);

=======
  }, [location.pathname]);

>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
<<<<<<< HEAD
      setLiveResults([]);
=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
    }
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Shawls', to: '/category/shawls' },
    { label: 'Tweed Fabric', to: '/category/tweed-fabric' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`transition-all duration-500 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
      >
        <div className="section-padding">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
<<<<<<< HEAD
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:order-first flex items-center">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.store_name || "AMKS"} className="h-8 lg:h-10 object-contain" />
              ) : (
                <span className="font-display text-2xl lg:text-3xl tracking-[0.3em] font-medium text-ink-900">
                  {settings?.store_name || "AMKS"}
                </span>
              )}
=======
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:order-first">
              <span className="font-display text-2xl lg:text-3xl tracking-[0.3em] font-medium text-ink-900">
                AMKS
              </span>
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative group ${
                    location.pathname === link.to ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-ink-900 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-5">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-1" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <Link to={user ? '/account' : '/login'} className="hidden sm:block p-1" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={toggleCart} className="relative p-1" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ink-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-ink-100"
            >
              <form onSubmit={handleSearch} className="section-padding py-4">
                <div className="flex items-center gap-3 max-w-3xl mx-auto">
                  <Search className="w-5 h-5 text-ink-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for shawls, tweed, collections..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder-ink-300"
                  />
                  <button type="submit" className="text-xs tracking-widest uppercase font-medium hover:text-ink-500">
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-ink-900/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-ink-100">
<<<<<<< HEAD
                {settings?.logo ? (
                  <img src={settings.logo} alt={settings.store_name || "AMKS"} className="h-8 object-contain" />
                ) : (
                  <span className="font-display text-2xl tracking-[0.3em]">{settings?.store_name || "AMKS"}</span>
                )}
=======
                <span className="font-display text-2xl tracking-[0.3em]">AMKS</span>
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col p-6 gap-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={link.to}
                      className="text-sm tracking-widest uppercase font-medium py-3.5 border-b border-ink-50 block hover:text-ink-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: navLinks.length * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={user ? '/account' : '/login'}
                    className="text-sm tracking-widest uppercase font-medium py-3.5 flex items-center gap-2 hover:text-ink-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {user ? 'My Account' : 'Sign In / Register'}
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
<<<<<<< HEAD

      {/* Search overlay modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 z-[120] flex flex-col pt-24"
          >
            <div className="section-padding flex-1 flex flex-col max-w-3xl mx-auto w-full">
              {/* Search input header */}
              <div className="flex items-center gap-4 border-b border-ink-200 pb-4">
                <Search className="w-6 h-6 text-ink-900" />
                <form onSubmit={handleSearch} className="flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for shawls, tweed, collections..."
                    className="w-full bg-transparent border-none outline-none text-2xl font-light font-display tracking-wider placeholder-ink-300 text-ink-900 focus:ring-0 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                  />
                </form>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 hover:bg-stone-light text-ink-900 animate-fade-in"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Suggestions / Results */}
              <div className="flex-1 overflow-y-auto py-8">
                {liveResults.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-ink-400 font-semibold mb-2">Suggestions</p>
                    <div className="grid gap-3">
                      {liveResults.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            setLiveResults([]);
                          }}
                          className="flex items-center gap-4 p-3 bg-stone-light/30 hover:bg-stone-light border border-ink-100/50 transition-colors"
                        >
                          {p.featured_image ? (
                            <img src={p.featured_image} alt="" className="w-12 h-16 object-cover bg-stone-light" />
                          ) : (
                            <div className="w-12 h-16 bg-stone-light flex items-center justify-center text-xs text-ink-300">No Image</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate">{p.name}</p>
                            <p className="text-xs text-ink-400 truncate">{p.category?.name}</p>
                          </div>
                          <span className="text-sm font-semibold text-ink-900">
                            {formatPrice(p.sale_price && p.sale_price < p.regular_price ? p.sale_price : p.regular_price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <p className="text-xs text-ink-400 text-center py-12">Press Enter to search for "{searchQuery}"</p>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[10px] uppercase tracking-widest text-ink-400 font-semibold mb-4">Popular Searches</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Shawl', 'Tweed', 'Pashmina', 'Wool'].map((term) => (
                        <button
                          type="button"
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-4 py-2 border border-ink-200 text-xs hover:border-ink-900 transition-colors bg-white font-medium"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
=======
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
    </>
  );
}
