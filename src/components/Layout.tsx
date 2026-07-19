import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Settings } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import BackToTop from './BackToTop';
import Ticker from './Ticker';
import MaintenanceScreen from './MaintenanceScreen';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { settings, loading } = useSettings();
  const { isAdmin } = useAuth();

  const announcement = settings?.announcement_text || 'Free Shipping on all orders Nationwide';
  const isMaintenance = Boolean(settings?.maintenance_mode);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If maintenance mode is active and the visitor is not an admin, display the Maintenance Screen
  if (isMaintenance && !isAdmin) {
    return <MaintenanceScreen settings={settings} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Admin Maintenance Mode Preview Banner */}
      {isMaintenance && isAdmin && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-medium flex items-center justify-between z-[60] border-b border-amber-600/20">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Store is in Maintenance Mode:</strong> Public visitors currently see the maintenance screen. You are viewing the live store in Admin Preview mode.
            </span>
          </div>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-1 bg-amber-950 text-amber-100 hover:bg-amber-900 px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0"
          >
            <Settings className="w-3 h-3" />
            Turn Off Maintenance
          </Link>
        </div>
      )}

      <div className="sticky top-0 z-50">
        <Ticker text={announcement} />
        <Header />
      </div>
      <motion.main
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </div>
  );
}
