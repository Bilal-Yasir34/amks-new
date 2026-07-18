import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });
    if (error) {
      toast.error('Something went wrong. Please try again.');
    } else {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding py-16 text-center bg-stone-light">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-5xl font-light">Contact Us</h1>
          <p className="text-sm text-ink-400 mt-4 max-w-lg mx-auto">We would love to hear from you. Reach out with any questions about our products or your order.</p>
        </motion.div>
      </section>

      <div className="section-padding py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="font-display text-3xl font-light mb-8">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 border border-ink-200 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-ink-700" />
                </div>
                <div>
                  <h4 className="text-xs tracking-widest uppercase font-medium mb-1">Email</h4>
                  <a href="mailto:amks.pk@hotmail.com" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">amks.pk@hotmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 border border-ink-200 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-ink-700" />
                </div>
                <div>
                  <h4 className="text-xs tracking-widest uppercase font-medium mb-1">Phone</h4>
                  <a href="tel:+923018621370" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">+92 301 8621370</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 border border-ink-200 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-ink-700" />
                </div>
                <div>
                  <h4 className="text-xs tracking-widest uppercase font-medium mb-1">Business Hours</h4>
                  <p className="text-sm text-ink-600">Monday — Saturday</p>
                  <p className="text-sm text-ink-600">10:00 AM — 8:00 PM</p>
                  <p className="text-sm text-ink-400 mt-1">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs tracking-widest uppercase font-medium block mb-2">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-medium block mb-2">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-medium block mb-2">Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-medium block mb-2">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
