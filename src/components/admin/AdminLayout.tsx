import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Ticket, Settings, LogOut, ExternalLink, Image, Users, Boxes, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }
  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400 mb-4">You do not have admin access.</p>
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
          <span className="font-display text-2xl tracking-[0.3em]">AMKS</span>
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
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-ink-900 text-white z-50">
        <div className="flex items-center justify-between p-4">
          <span className="font-display text-xl tracking-[0.3em]">AMKS Admin</span>
          <button onClick={handleSignOut}><LogOut className="w-5 h-5" /></button>
        </div>
        <nav className="flex overflow-x-auto gap-1 px-2 pb-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-ink-400'}`
              }
            >
              <link.icon className="w-3.5 h-3.5" /> {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
