import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import { slugify } from '../../lib/utils';
import type { Category } from '../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminCategories() {
  const [categories, setCategories] = useState<(Category & { product_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    const cats = (data || []) as Category[];
    // Get product counts
    const withCounts = await Promise.all((cats).map(async (c) => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('archived', false);
      return { ...c, product_count: count || 0 };
    }));
    setCategories(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    if (error) toast.error('Failed to delete.');
    else { toast.success('Category deleted.'); loadCategories(); }
    setDeleteId(null);
  };

  const toggleVisible = async (cat: Category) => {
    await supabase.from('categories').update({ is_visible: !cat.is_visible }).eq('id', cat.id);
    loadCategories();
  };

  const moveCategory = async (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= categories.length) return;
    const newCats = [...categories];
    [newCats[idx], newCats[target]] = [newCats[target], newCats[idx]];
    newCats.forEach((c, i) => { c.sort_order = i + 1; });
    setCategories(newCats);
    for (const c of newCats) {
      await supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-light">Categories</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary !py-2.5 !px-5 text-xs">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-ink-400">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-ink-400">No categories yet.</p>
        ) : (
          categories.map((cat, idx) => (
            <div key={cat.id} className="bg-white border border-ink-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {cat.thumbnail && <img src={cat.thumbnail} alt={cat.name} className="w-12 h-12 object-cover bg-ink-50" />}
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-ink-400">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveCategory(idx, 'up')} disabled={idx === 0} className="p-1 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                  <button onClick={() => moveCategory(idx, 'down')} disabled={idx === categories.length - 1} className="p-1 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                  <button onClick={() => toggleVisible(cat)} aria-label="Toggle visibility">
                    {cat.is_visible ? <Eye className="w-4 h-4 text-ink-500" /> : <EyeOff className="w-4 h-4 text-ink-300" />}
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-xs text-ink-400 line-clamp-2 mb-2">{cat.description}</p>}
              <p className="text-xs text-ink-300 mb-3">{cat.product_count} products</p>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(cat); setShowForm(true); }} className="p-1.5 hover:bg-ink-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(cat.id)} className="p-1.5 hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <CategoryForm category={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { loadCategories(); setShowForm(false); setEditing(null); }} />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        message="Products will remain but lose their category link. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!category);
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    banner_image: category?.banner_image || '',
    thumbnail: category?.thumbnail || '',
    sort_order: category?.sort_order?.toString() || '0',
    is_visible: category?.is_visible ?? true,
    seo_title: category?.seo_title || '',
    seo_description: category?.seo_description || '',
    meta_keywords: category?.meta_keywords || '',
  });
  const [saving, setSaving] = useState(false);

  const handleUpload = async (file: File, field: 'banner_image' | 'thumbnail') => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
    if (error) { toast.error('Upload failed.'); return; }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
    await supabase.from('media_assets').insert({ url: data.publicUrl, file_name: file.name, file_path: fileName, content_type: file.type, file_size: file.size });
    setForm({ ...form, [field]: data.publicUrl });
    toast.success('Image uploaded.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = { ...form, slug, sort_order: parseInt(form.sort_order) || 0 };
    if (category) {
      const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
      if (error) toast.error('Failed to update.'); else toast.success('Category updated.');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast.error('Failed to create.'); else toast.success('Category created.');
    }
    setSaving(false);
    onSaved();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-ink-900/50 z-[80]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[90] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100">
          <h2 className="font-display text-2xl font-light">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="text-xs text-ink-400 block mb-1">Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: isSlugManuallyEdited ? form.slug : slugify(e.target.value) })} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Slug</label><input value={form.slug} onChange={(e) => { setIsSlugManuallyEdited(true); setForm({ ...form, slug: e.target.value }); }} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" /></div>
          <div>
            <label className="text-xs text-ink-400 block mb-2">Thumbnail</label>
            {form.thumbnail && <img src={form.thumbnail} alt="Thumbnail" className="w-20 h-20 object-cover mb-2 bg-ink-50" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'thumbnail')} className="text-xs" />
          </div>
          <div>
            <label className="text-xs text-ink-400 block mb-2">Banner Image</label>
            {form.banner_image && <img src={form.banner_image} alt="Banner" className="w-full h-32 object-cover mb-2 bg-ink-50" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner_image')} className="text-xs" />
          </div>
          <div><label className="text-xs text-ink-400 block mb-1">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="accent-ink-900" /> Visible on storefront
          </label>
          <div className="border-t border-ink-100 pt-4">
            <h3 className="text-xs tracking-widest uppercase font-medium mb-4 text-ink-400">SEO</h3>
            <div><label className="text-xs text-ink-400 block mb-1">SEO Title</label><input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="input-field" /></div>
            <div className="mt-3"><label className="text-xs text-ink-400 block mb-1">SEO Description</label><textarea rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} className="input-field resize-none" /></div>
            <div className="mt-3"><label className="text-xs text-ink-400 block mb-1">Meta Keywords</label><input value={form.meta_keywords} onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
