import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import BackToTop from './BackToTop';
import Ticker from './Ticker';
import { supabase } from '../lib/supabase';
export default function Layout() {
  const [announcement, setAnnouncement] = useState('Free Shipping on all orders Nationwide');

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) {
        if (data.announcement_text) setAnnouncement(data.announcement_text);
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
