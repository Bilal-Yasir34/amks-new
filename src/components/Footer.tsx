import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, Settings } from '../types';
import toast from 'react-hot-toast';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 2a9.966 9.966 0 0 0-9.97 9.97c.003 2.228.736 4.417 2.096 6.223L2.7 23.5l5.51-1.478a9.916 9.916 0 0 0 4.82 1.258h.004a9.967 9.967 0 0 0 9.97-9.97A9.973 9.973 0 0 0 12.03 2Zm6.49 13.914c-.26.74-1.28 1.36-2.07 1.54-.74.17-1.7.3-4.88-1.01-4.07-1.68-6.7-5.83-6.9-6.1-.2-.27-1.63-2.17-1.63-4.14 0-1.97 1-2.94 1.36-3.3.36-.37.78-.46 1.04-.46.26 0 .52.01.75.02.24.01.48-.09.76.58.29.7.99 2.4.1 2.58-.09.18-.8.36-1 .54-.18.18-.38.38-.16.76.22.38.98 1.62 2.1 2.62 1.45 1.29 2.67 1.69 3.05 1.88.38.19.6.16.82-.09.22-.25.96-1.12 1.22-1.5.26-.38.52-.32.88-.19.36.13 2.29 1.08 2.68 1.28.39.2.65.3.75.48.1.18.1.92-.16 1.66Z"/>
  </svg>
);

const getSocialLink = (url: string | null | undefined, fallback: string) => {
  if (!url || url.trim() === '' || url.trim() === '#') return fallback;
  return url;
};

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_visible', true).order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as Settings);
    });
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() });
    if (error) {
      if (error.code === '23505') toast.error('You are already subscribed.');
      else toast.error('Something went wrong. Please try again.');
    } else {
      toast.success('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-ink-900 text-white">
      {/* Newsletter */}
      <div className="border-b border-ink-700">
        <div className="section-padding py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-3xl md:text-4xl font-light mb-3">Join the AMKS Circle</h3>
            <p className="text-ink-300 text-sm mb-8 leading-relaxed">
              Subscribe for exclusive collections, early access, and stories of craftsmanship.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent border-b border-ink-600 px-0 py-3 text-sm text-white placeholder-ink-500 focus:border-white focus:outline-none transition-colors"
              />
              <button type="submit" className="btn-primary !bg-white !text-ink-900 hover:!bg-ink-200">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
<<<<<<< HEAD
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.store_name || "AMKS"} className="h-8 object-contain mb-4" />
            ) : (
              <h4 className="font-display text-2xl tracking-[0.3em] mb-4">{settings?.store_name || "AMKS"}</h4>
            )}
=======
            <h4 className="font-display text-2xl tracking-[0.3em] mb-4">AMKS</h4>
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
            <p className="text-ink-400 text-sm leading-relaxed">
              {settings?.footer_text || 'Premium Shawls & Tweed Fabric. Crafted with luxury.'}
            </p>
            <div className="flex gap-4 mt-6 items-center">
              <a
                href={getSocialLink(settings?.social_links?.instagram, "https://www.instagram.com/fabric_and_shawal_by_amks.pk/")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-ink-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={getSocialLink(settings?.social_links?.facebook, "https://www.facebook.com/profile.php?id=100095291003161")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-ink-400 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={getSocialLink(settings?.social_links?.whatsapp, "https://wa.me/923018621370")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-ink-400 hover:text-white transition-colors flex items-center"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs tracking-widest uppercase font-medium mb-5 text-ink-300">Quick Links</h5>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-ink-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-sm text-ink-400 hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/about" className="text-sm text-ink-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-ink-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="text-sm text-ink-400 hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs tracking-widest uppercase font-medium mb-5 text-ink-300">Categories</h5>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-ink-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs tracking-widest uppercase font-medium mb-5 text-ink-300">Contact</h5>
            <ul className="space-y-4">
              <li>
                <a href="mailto:amks.pk@hotmail.com" className="flex items-start gap-3 text-sm text-ink-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  amks.pk@hotmail.com
                </a>
              </li>
              <li>
                <a href="tel:+923018621370" className="flex items-start gap-3 text-sm text-ink-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  +92 301 8621370
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                {settings?.address || 'Lahore, Pakistan'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-ink-700">
        <div className="section-padding py-6 text-center">
          <p className="text-xs text-ink-500 tracking-wider">
            © {new Date().getFullYear()} AMKS. All rights reserved. Crafted with luxury.
          </p>
        </div>
      </div>
    </footer>
  );
}
