import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, User, Truck, ChevronDown } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { formatPrice } from '../lib/utils';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setLiveResults([]);
  }, [location.pathname]);

  // Load visible categories for dynamic navigation dropdowns
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data || []) as Category[]));
  }, []);

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
              return (
                text.includes(token) ||
                text.includes(stem) ||
                (token.endsWith('s') && text.includes(token.slice(0, -1)))
              );
            };
            return matchTarget(name) || matchTarget(desc) || matchTarget(sku) || matchTarget(catName);
          });
        });
        setLiveResults(filtered.slice(0, 5));
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setLiveResults([]);
    }
  };

  const parentCategories = categories.filter((c) => !c.parent_id);

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
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:order-first flex items-center">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.store_name || "AMKS by AMKAS INTERNATIONAL"} className="h-8 lg:h-10 object-contain" />
              ) : (
                <div className="flex flex-col items-center lg:items-start leading-none">
                  <span className="font-display text-2xl lg:text-3xl tracking-[0.3em] font-medium text-ink-900">
                    {settings?.store_name || "AMKS"}
                  </span>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-ink-400 font-sans mt-0.5 font-normal">
                    by AMKAS INTERNATIONAL
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              <Link
                to="/"
                className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative group py-2 ${
                  location.pathname === '/' ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-px bg-ink-900 transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link
                to="/shop"
                className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative group py-2 ${
                  location.pathname === '/shop' ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Shop
                <span className="absolute bottom-0 left-0 w-0 h-px bg-ink-900 transition-all duration-300 group-hover:w-full" />
              </Link>

              {/* Dynamic Category Nav Items with Dropdowns */}
              {parentCategories.map((parent) => {
                const subcats = categories.filter((c) => c.parent_id === parent.id);
                const parentPath = `/category/${parent.slug}`;
                const isActive = location.pathname === parentPath || subcats.some((s) => location.pathname === `/category/${s.slug}`);

                return (
                  <div key={parent.id} className="relative group py-2">
                    <Link
                      to={parentPath}
                      className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                        isActive ? 'text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-900'
                      }`}
                    >
                      <span>{parent.name}</span>
                      {subcats.length > 0 && (
                        <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-200 opacity-70" />
                      )}
                    </Link>

                    {/* Subcategories Dropdown Menu */}
                    {subcats.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block pt-2 z-50 animate-fade-in min-w-[200px]">
                        <div className="bg-white border border-ink-100 shadow-xl py-3 rounded-sm">
                          <div className="px-4 pb-2 border-b border-ink-100/60 mb-1">
                            <Link to={parentPath} className="block text-[11px] font-bold uppercase tracking-wider text-ink-900 hover:text-ink-600">
                              All {parent.name}
                            </Link>
                          </div>
                          {subcats.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/category/${sub.slug}`}
                              className={`block px-4 py-2 text-xs transition-colors ${
                                location.pathname === `/category/${sub.slug}`
                                  ? 'text-ink-900 font-semibold bg-stone-light/50'
                                  : 'text-ink-600 hover:text-ink-900 hover:bg-stone-light/40'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                to="/about"
                className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative group py-2 ${
                  location.pathname === '/about' ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-px bg-ink-900 transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link
                to="/contact"
                className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative group py-2 ${
                  location.pathname === '/contact' ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-px bg-ink-900 transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-5">
              <a
                href="https://fastex.pk/trackingDetail?trackingNo="
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-ink-500 transition-colors flex items-center gap-1.5"
                title="Track Order"
                aria-label="Track Order"
              >
                <Truck className="w-5 h-5 text-ink-900 hover:text-ink-600 transition-colors" />
                <span className="hidden xl:inline text-[11px] tracking-widest uppercase font-medium">Track Order</span>
              </a>
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
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-ink-100">
                {settings?.logo ? (
                  <img src={settings.logo} alt={settings.store_name || "AMKS by AMKAS INTERNATIONAL"} className="h-8 object-contain" />
                ) : (
                  <div className="flex flex-col leading-none">
                    <span className="font-display text-2xl tracking-[0.3em] font-medium text-ink-900">{settings?.store_name || "AMKS"}</span>
                    <span className="text-[8px] tracking-[0.25em] uppercase text-ink-400 font-sans mt-0.5">by AMKAS INTERNATIONAL</span>
                  </div>
                )}
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col p-6 gap-1">
                <Link to="/" className="text-sm tracking-widest uppercase font-medium py-3 border-b border-ink-50 block hover:text-ink-500">
                  Home
                </Link>
                <Link to="/shop" className="text-sm tracking-widest uppercase font-medium py-3 border-b border-ink-50 block hover:text-ink-500">
                  Shop All
                </Link>

                {/* Mobile Categories */}
                {parentCategories.map((parent) => {
                  const subcats = categories.filter((c) => c.parent_id === parent.id);
                  const isExpanded = expandedMobileCategory === parent.id;

                  return (
                    <div key={parent.id} className="border-b border-ink-50 py-2">
                      <div className="flex items-center justify-between py-1">
                        <Link
                          to={`/category/${parent.slug}`}
                          className="text-sm tracking-widest uppercase font-medium text-ink-900 hover:text-ink-600 flex-1"
                        >
                          {parent.name}
                        </Link>
                        {subcats.length > 0 && (
                          <button
                            onClick={() => setExpandedMobileCategory(isExpanded ? null : parent.id)}
                            className="p-2 text-ink-400 hover:text-ink-900"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {subcats.length > 0 && isExpanded && (
                        <div className="pl-4 mt-1 space-y-2 pb-2 border-l border-ink-100">
                          {subcats.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/category/${sub.slug}`}
                              className="text-xs text-ink-600 hover:text-ink-900 block py-1 font-medium"
                            >
                              ↳ {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Link to="/about" className="text-sm tracking-widest uppercase font-medium py-3 border-b border-ink-50 block hover:text-ink-500">
                  About
                </Link>
                <Link to="/contact" className="text-sm tracking-widest uppercase font-medium py-3 border-b border-ink-50 block hover:text-ink-500">
                  Contact
                </Link>

                <div className="pt-4 space-y-3">
                  <Link
                    to={user ? '/account' : '/login'}
                    className="text-sm tracking-widest uppercase font-medium py-2 flex items-center gap-2 text-ink-900 hover:text-ink-500"
                  >
                    <User className="w-4 h-4" />
                    {user ? 'My Account' : 'Sign In / Register'}
                  </Link>

                  <a
                    href="https://fastex.pk/trackingDetail?trackingNo="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm tracking-widest uppercase font-medium py-2 flex items-center gap-2 text-ink-900 hover:text-ink-500"
                  >
                    <Truck className="w-4 h-4 text-ink-900" />
                    Track Order
                  </a>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </>
  );
}
