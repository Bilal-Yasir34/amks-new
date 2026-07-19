import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Instagram, MessageCircle, ShieldCheck, ArrowRight, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Settings } from '../types';

interface MaintenanceScreenProps {
  settings: Settings | null;
}

export default function MaintenanceScreen({ settings }: MaintenanceScreenProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const storeName = settings?.store_name || 'AMKS';
  const phone = settings?.phone || '+92 300 0000000';
  const emailAddr = settings?.contact_email || 'info@amks.pk';
  const instagram = settings?.social_links?.instagram || 'https://www.instagram.com/fabric_and_shawal_by_amks.pk/';
  const whatsapp = settings?.social_links?.whatsapp || `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Thank you! We'll notify you as soon as our store is back online.");
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic background glow / ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-stone-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        {settings?.logo ? (
          <img src={settings.logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
        ) : (
          <span className="font-display text-2xl lg:text-3xl tracking-[0.3em] font-light text-white uppercase">
            {storeName}
          </span>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-amber-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Scheduled Maintenance
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs tracking-widest uppercase text-stone-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Upgrading Your Experience
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide text-white leading-tight">
            We'll Be Back <span className="italic font-normal text-amber-200/90">Very Soon</span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Our online boutique is currently undergoing scheduled maintenance to improve system performance and bring you new exquisite collections.
          </p>

          {/* Email Subscription Form */}
          <div className="pt-6 max-w-md mx-auto w-full">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-white/5 border border-amber-400/30 text-amber-200 text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                You're on the list! We'll email you the moment we launch.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for updates..."
                  className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400/60 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-white text-ink-950 hover:bg-amber-100 font-medium px-6 py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shrink-0 group"
                >
                  Notify Me
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>

          {/* Direct Contact Options */}
          <div className="pt-10 border-t border-white/10 mt-10">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-6 font-medium">
              Need immediate assistance? Contact us directly
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-stone-300 hover:text-white group"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">WhatsApp</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Quick Chat</span>
              </a>

              <a
                href={`mailto:${emailAddr}`}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-stone-300 hover:text-white group"
              >
                <Mail className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Email Us</span>
                <span className="text-[10px] text-stone-400 mt-0.5 truncate max-w-full px-1">{emailAddr}</span>
              </a>

              <a
                href={`tel:${phone}`}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-stone-300 hover:text-white group"
              >
                <Phone className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Call Us</span>
                <span className="text-[10px] text-stone-400 mt-0.5">{phone}</span>
              </a>

              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all text-stone-300 hover:text-white group"
              >
                <Instagram className="w-5 h-5 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Instagram</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Follow Updates</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
        <div>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/admin"
            className="text-stone-400 hover:text-white underline underline-offset-4 transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Admin Access
          </a>
        </div>
      </footer>
    </div>
  );
}
