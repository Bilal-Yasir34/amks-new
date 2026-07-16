import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import type { HeroBanner, HomepageSection } from '../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminHomepage() {
  const [tab, setTab] = useState<'banners' | 'sections'>('banners');
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase.from('hero_banners').select('*').order('sort_order'),
      supabase.from('homepage_sections').select('*').order('sort_order'),
    ]);
    setBanners((b || []) as HeroBanner[]);
    setSections((s || []) as HomepageSection[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteBanner = async () => {
    if (!deleteBannerId) return;
    await supabase.from('hero_banners').delete().eq('id', deleteBannerId);
    toast.success('Banner deleted.');
    setDeleteBannerId(null);
    load();
  };

  const toggleSection = async (s: HomepageSection) => {
    await supabase.from('homepage_sections').update({ is_visible: !s.is_visible }).eq('id', s.id);
    load();
  };

  const moveSection = async (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sections.length) return;
    const newSecs = [...sections];
    [newSecs[idx], newSecs[target]] = [newSecs[target], newSecs[idx]];
    newSecs.forEach((s, i) => { s.sort_order = i + 1; });
    setSections(newSecs);
    for (const s of newSecs) {
      await supabase.from('homepage_sections').update({ sort_order: s.sort_order }).eq('id', s.id);
    }
  };

  const moveBanner = async (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= banners.length) return;
    const newBans = [...banners];
    [newBans[idx], newBans[target]] = [newBans[target], newBans[idx]];
    newBans.forEach((b, i) => { b.sort_order = i + 1; });
    setBanners(newBans);
    for (const b of newBans) {
      await supabase.from('hero_banners').update({ sort_order: b.sort_order }).eq('id', b.id);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light mb-8">Homepage Management</h1>

      <div className="flex gap-6 border-b border-ink-100 mb-8">
        <button onClick={() => setTab('banners')} className={`pb-4 text-sm transition-colors ${tab === 'banners' ? 'text-ink-900 border-b-2 border-ink-900 -mb-px' : 'text-ink-400 hover:text-ink-900'}`}>Hero Banners</button>
        <button onClick={() => setTab('sections')} className={`pb-4 text-sm transition-colors ${tab === 'sections' ? 'text-ink-900 border-b-2 border-ink-900 -mb-px' : 'text-ink-400 hover:text-ink-900'}`}>Homepage Sections</button>
      </div>

      {loading ? <p className="text-sm text-ink-400">Loading...</p> : (
        <>
          {tab === 'banners' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => { setEditingBanner(null); setShowBannerForm(true); }} className="btn-primary !py-2.5 !px-5 text-xs">
                  <Plus className="w-4 h-4" /> Add Banner
                </button>
              </div>
              <div className="space-y-3">
                {banners.map((banner, idx) => (
                  <div key={banner.id} className="bg-white border border-ink-100 p-4 flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveBanner(idx, 'up')} disabled={idx === 0} className="p-1 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                      <button onClick={() => moveBanner(idx, 'down')} disabled={idx === banners.length - 1} className="p-1 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                    </div>
                    {banner.image_url && <img src={banner.image_url} alt="" className="w-24 h-14 object-cover bg-ink-50" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{banner.title}</p>
                      <p className="text-xs text-ink-400 line-clamp-1">{banner.subtitle}</p>
                      <p className="text-xs text-ink-300 mt-1">CTA: {banner.cta_text || '—'} → {banner.cta_link || '—'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingBanner(banner); setShowBannerForm(true); }} className="p-1.5 hover:bg-ink-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteBannerId(banner.id)} className="p-1.5 hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && <p className="text-sm text-ink-400 text-center py-8">No banners yet.</p>}
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="bg-white border border-ink-100">
              <table className="w-full text-sm">
                <thead className="bg-stone-light text-xs text-ink-400 uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-4 font-medium w-16">Order</th>
                    <th className="text-left p-4 font-medium">Section</th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Visible</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s, idx) => (
                    <tr key={s.id} className="border-t border-ink-50">
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                          <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} className="p-1 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{s.section_key}</td>
                      <td className="p-4 text-ink-500">{s.title || '—'}</td>
                      <td className="p-4">
                        <button onClick={() => toggleSection(s)}>
                          {s.is_visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-ink-300" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showBannerForm && (
          <BannerForm banner={editingBanner} onClose={() => { setShowBannerForm(false); setEditingBanner(null); }} onSaved={() => { load(); setShowBannerForm(false); setEditingBanner(null); }} />
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleteBannerId} title="Delete Banner" message="This will permanently remove the hero banner." confirmLabel="Delete" danger onConfirm={deleteBanner} onCancel={() => setDeleteBannerId(null)} />
    </div>
  );
}

function BannerForm({ banner, onClose, onSaved }: { banner: HeroBanner | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    cta_text: banner?.cta_text || '',
    cta_link: banner?.cta_link || '',
    image_url: banner?.image_url || '',
    sort_order: banner?.sort_order?.toString() || '0',
    is_visible: banner?.is_visible ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleUpload = async (file: File) => {
    const fileName = `banner-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
    if (error) { toast.error('Upload failed.'); return; }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
    await supabase.from('media_assets').insert({ url: data.publicUrl, file_name: file.name, file_path: fileName, content_type: file.type, file_size: file.size });
    setForm({ ...form, image_url: data.publicUrl });
    toast.success('Image uploaded.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    if (banner) {
      const { error } = await supabase.from('hero_banners').update(payload).eq('id', banner.id);
      if (error) toast.error('Failed to update.'); else toast.success('Banner updated.');
    } else {
      const { error } = await supabase.from('hero_banners').insert(payload);
      if (error) toast.error('Failed to create.'); else toast.success('Banner created.');
    }
    setSaving(false);
    onSaved();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-ink-900/50 z-[80]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[90] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100">
          <h2 className="font-display text-2xl font-light">{banner ? 'Edit Banner' : 'New Banner'}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="text-xs text-ink-400 block mb-1">Heading *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Subheading</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-ink-400 block mb-1">CTA Button Text</label><input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs text-ink-400 block mb-1">CTA Button Link</label><input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} className="input-field" /></div>
          </div>
          <div>
            <label className="text-xs text-ink-400 block mb-2">Hero Image</label>
            {form.image_url && <img src={form.image_url} alt="Banner" className="w-full h-32 object-cover mb-2 bg-ink-50" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="text-xs" />
          </div>
          <div><label className="text-xs text-ink-400 block mb-1">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="accent-ink-900" /> Visible
          </label>
          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
