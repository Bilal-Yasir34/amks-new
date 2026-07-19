import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import type { Settings } from '../../types';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import { AlertTriangle, CheckCircle, Wrench, Lock, Unlock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const SETTINGS_PASSWORD = 'AmksSettings03018621370!$$$';
const SESSION_KEY = 'amks_settings_auth';

export default function AdminSettings() {
  const { updateSettingsState } = useSettings();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'general' | 'bank' | 'shipping' | 'social'>('general');

  // Password Protection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setSettings(data as Settings | null));
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === SETTINGS_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
      toast.success('Settings unlocked successfully.');
    } else {
      setErrorMsg('Incorrect password. Access denied.');
      toast.error('Incorrect settings password.');
    }
  };

  const handleLockSettings = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setEnteredPassword('');
    toast.success('Settings locked.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const updatedData = {
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
    };

    const { error } = await supabase.from('settings').update(updatedData).eq('id', 1);

    if (error) {
      toast.error('Failed to save settings.');
    } else {
      updateSettingsState({ ...settings, ...updatedData });
      toast.success(settings.maintenance_mode ? 'Settings saved. Maintenance mode is now ON.' : 'Settings saved. Store is live.');
    }
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

  // Render Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 rounded-xl border border-ink-100 shadow-sm text-center"
        >
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl font-light text-ink-900 mb-2">Protected Settings</h2>
          <p className="text-xs text-ink-400 mb-6 leading-relaxed">
            Store settings contain sensitive configuration. Please enter the security password to view and edit settings.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-ink-400 block mb-1 font-medium">Settings Security Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  placeholder="Enter settings password"
                  className="input-field pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-100">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-xs tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              Unlock Settings
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!settings) return <p className="text-sm text-ink-400">Loading settings...</p>;

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'social', label: 'Social Links' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">Store Settings</h1>
          <p className="text-xs text-ink-400 mt-1">Manage general configuration, bank accounts, and maintenance status.</p>
        </div>
        <button
          type="button"
          onClick={handleLockSettings}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs text-ink-600 hover:text-ink-900 bg-white border border-ink-200 hover:border-ink-300 rounded transition-colors self-start sm:self-auto"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock Settings
        </button>
      </div>

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

            {/* Maintenance Mode Option */}
            <div className={`p-4 rounded-lg border transition-all ${settings.maintenance_mode ? 'bg-amber-50 border-amber-300' : 'bg-stone-50 border-ink-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${settings.maintenance_mode ? 'bg-amber-100 text-amber-800' : 'bg-ink-100 text-ink-600'}`}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-ink-900">Maintenance Mode</h3>
                      {settings.maintenance_mode ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-200 text-amber-900">
                          <AlertTriangle className="w-3 h-3" /> ON (Store Hidden)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> OFF (Store Live)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      When enabled, public visitors will see a maintenance screen. Admins can still access the website & admin panel.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
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
            <div><label className="text-xs text-ink-400 block mb-1">WhatsApp URL</label><input value={settings.social_links?.whatsapp || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, whatsapp: e.target.value } })} className="input-field" /></div>
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
