import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import type { Settings } from '../../types';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'general' | 'bank' | 'shipping' | 'social'>('general');

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setSettings(data as Settings | null));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      store_name: settings.store_name,
      contact_email: settings.contact_email,
      phone: settings.phone,
      address: settings.address,
      footer_text: settings.footer_text,
      announcement_text: settings.announcement_text,
      currency: settings.currency,
      logo: settings.logo,
      favicon: settings.favicon,
      social_links: settings.social_links,
      bank_name: settings.bank_name,
      bank_account_title: settings.bank_account_title,
      bank_account_number: settings.bank_account_number,
      bank_iban: settings.bank_iban,
      bank_branch_code: settings.bank_branch_code,
      payment_instructions: settings.payment_instructions,
      shipping_charge: settings.shipping_charge,
      free_shipping_threshold: settings.free_shipping_threshold,
      maintenance_mode: settings.maintenance_mode,
    }).eq('id', 1);
    if (error) toast.error('Failed to save.'); else toast.success('Settings saved.');
    setSaving(false);
  };

  const handleUpload = async (file: File, field: 'logo' | 'favicon') => {
    const fileName = `${field}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
    if (error) { toast.error('Upload failed.'); return; }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
    await supabase.from('media_assets').insert({ url: data.publicUrl, file_name: file.name, file_path: fileName, content_type: file.type, file_size: file.size });
    setSettings({ ...settings!, [field]: data.publicUrl });
    toast.success('Image uploaded.');
  };

  if (!settings) return <p className="text-sm text-ink-400">Loading...</p>;

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'social', label: 'Social Links' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-light mb-8">Store Settings</h1>

      <div className="flex gap-6 border-b border-ink-100 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`pb-4 text-sm transition-colors whitespace-nowrap ${tab === t.key ? 'text-ink-900 border-b-2 border-ink-900 -mb-px' : 'text-ink-400 hover:text-ink-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {tab === 'general' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div><label className="text-xs text-ink-400 block mb-1">Store Name</label><input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Contact Email</label><input type="email" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Phone</label><input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Business Address</label><input value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Announcement Bar Text</label><input value={settings.announcement_text} onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Footer Text</label><input value={settings.footer_text || ''} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Currency</label><input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="input-field" /></div>
            <div>
              <label className="text-xs text-ink-400 block mb-2">Store Logo</label>
              {settings.logo && <img src={settings.logo} alt="Logo" className="h-16 mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} className="text-xs" />
              {settings.logo && <button type="button" onClick={() => setSettings({ ...settings, logo: null })} className="block text-xs text-red-500 mt-1">Remove logo</button>}
            </div>
            <div>
              <label className="text-xs text-ink-400 block mb-2">Favicon</label>
              {settings.favicon && <img src={settings.favicon} alt="Favicon" className="w-8 h-8 mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'favicon')} className="text-xs" />
              {settings.favicon && <button type="button" onClick={() => setSettings({ ...settings, favicon: null })} className="block text-xs text-red-500 mt-1">Remove favicon</button>}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })} className="accent-ink-900" /> Maintenance Mode
            </label>
          </motion.div>
        )}

        {tab === 'bank' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div><label className="text-xs text-ink-400 block mb-1">Bank Name</label><input value={settings.bank_name || ''} onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Account Title</label><input value={settings.bank_account_title || ''} onChange={(e) => setSettings({ ...settings, bank_account_title: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Account Number</label><input value={settings.bank_account_number || ''} onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">IBAN</label><input value={settings.bank_iban || ''} onChange={(e) => setSettings({ ...settings, bank_iban: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Branch Code</label><input value={settings.bank_branch_code || ''} onChange={(e) => setSettings({ ...settings, bank_branch_code: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Payment Instructions</label><textarea rows={3} value={settings.payment_instructions || ''} onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })} className="input-field resize-none" /></div>
          </motion.div>
        )}

        {tab === 'shipping' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div><label className="text-xs text-ink-400 block mb-1">Shipping Charge (Rs.)</label><input type="number" value={settings.shipping_charge} onChange={(e) => setSettings({ ...settings, shipping_charge: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Free Shipping Threshold (Rs.)</label><input type="number" value={settings.free_shipping_threshold} onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            <p className="text-xs text-ink-400">Orders above the threshold will have free shipping.</p>
          </motion.div>
        )}

        {tab === 'social' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div><label className="text-xs text-ink-400 block mb-1">Instagram URL</label><input value={settings.social_links?.instagram || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, instagram: e.target.value } })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Facebook URL</label><input value={settings.social_links?.facebook || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, facebook: e.target.value } })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">Twitter / X URL</label><input value={settings.social_links?.twitter || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, twitter: e.target.value } })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">YouTube URL</label><input value={settings.social_links?.youtube || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, youtube: e.target.value } })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">TikTok URL</label><input value={settings.social_links?.tiktok || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, tiktok: e.target.value } })} className="input-field" /></div>
          </motion.div>
        )}

        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}
