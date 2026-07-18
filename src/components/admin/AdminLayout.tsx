import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Ticket, Settings, LogOut, ExternalLink, Image, Users, Boxes, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) {
        setSettings(data);
        if (data.favicon) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon;
        }
      }
    });
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await supabase.auth.signOut();
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const isUserAdmin = data.user && (
        data.user.user_metadata?.is_admin === true || 
        data.user.email === 'admin@amks.pk'
      );
      if (!isUserAdmin) {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account is not authorized as an administrator.');
      }
      toast.success('Welcome to the Admin Portal');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-light p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="w-full max-w-md bg-white p-8 lg:p-10 shadow-sm border border-ink-100"
        >
          <div className="text-center mb-8">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.store_name || "AMKS"} className="h-16 mx-auto mb-4 object-contain" />
            ) : (
              <span className="font-display text-3xl tracking-[0.3em] font-medium text-ink-900 block mb-2">{settings?.store_name || "AMKS"}</span>
            )}
            <p className="text-xs tracking-widest uppercase font-medium text-ink-400">Admin Portal</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="text-xs tracking-widest uppercase font-medium block mb-2">Admin Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input-field" 
                placeholder="admin@amks.pk"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase font-medium block mb-2">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xs tracking-widest uppercase">
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out.');
    navigate('/');
  };

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package, end: false },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree, end: false },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
    { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket, end: false },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes, end: false },
    { to: '/admin/homepage', label: 'Homepage', icon: Home, end: false },
    { to: '/admin/media', label: 'Media Library', icon: Image, end: false },
    { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
  ];

  return (
    <div className="min-h-screen flex bg-stone-light">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-900 text-white flex flex-col shrink-0 hidden lg:flex">
        <div className="p-6 border-b border-ink-700">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.store_name || "AMKS"} className="h-10 object-contain mb-2" />
          ) : (
            <span className="font-display text-2xl tracking-[0.3em]">{settings?.store_name || "AMKS"}</span>
          )}
          <p className="text-xs text-ink-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-ink-400 hover:text-white hover:bg-white/5'}`
              }
            >
              <link.icon className="w-4 h-4" /> {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-700 space-y-1">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-sm text-ink-400 hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" /> View Store
          </a>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-sm text-ink-400 hover:text-white transition-colors w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-ink-900 text-white z-50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(true)} 
            className="p-1 -ml-1 text-ink-300 hover:text-white"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-center">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.store_name || "AMKS"} className="h-6 object-contain" />
            ) : (
              <span className="font-display text-lg tracking-[0.3em] font-medium">AMKS Admin</span>
            )}
          </div>

          <button type="button" onClick={handleSignOut} className="p-1 -mr-1 text-ink-300 hover:text-white" aria-label="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink-900/60 z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-ink-900 text-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-ink-700 flex items-center justify-between">
                <div>
                  {settings?.logo ? (
                    <img src={settings.logo} alt={settings.store_name} className="h-8 object-contain" />
                  ) : (
                    <span className="font-display text-2xl tracking-[0.3em]">AMKS</span>
                  )}
                  <p className="text-xs text-ink-400 mt-1">Admin Panel</p>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-white/10" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${
                        isActive ? 'bg-white/10 text-white' : 'text-ink-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <link.icon className="w-4 h-4" /> {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-ink-700 space-y-1">
                <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-sm text-ink-400 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" /> View Store
                </a>
                <button type="button" onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-sm text-ink-400 hover:text-white transition-colors w-full text-left">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
