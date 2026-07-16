import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Copy, X, Search, Archive, RotateCcw, Layers, ChevronDown, ChevronUp, GripVertical, Trash } from 'lucide-react';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import { slugify, formatPrice } from '../../lib/utils';
import type { Product, Category, ProductImage, ProductVariantGroup, ProductVariantCombination } from '../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Pagination from '../../components/admin/Pagination';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pageSize = 10;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false });
    setProducts((data || []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories((data || []) as Category[]));
  }, [loadProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    if (error) toast.error('Failed to delete.');
    else { toast.success('Product deleted.'); loadProducts(); }
    setDeleteId(null);
  };

  const handleDuplicate = async (p: Product) => {
    const { id, created_at, updated_at, ...rest } = p;
    const { error } = await supabase.from('products').insert({ ...rest, name: `${p.name} (Copy)`, slug: `${p.slug}-copy-${Date.now().toString(36)}` });
    if (error) toast.error('Failed to duplicate.');
    else { toast.success('Product duplicated.'); loadProducts(); }
  };

  const handleArchive = async (p: Product) => {
    const { error } = await supabase.from('products').update({ archived: !p.archived }).eq('id', p.id);
    if (error) toast.error('Failed.');
    else { toast.success(p.archived ? 'Product restored.' : 'Product archived.'); loadProducts(); }
  };

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku || '').toLowerCase().includes(q)) return false;
    }
    if (statusFilter === 'archived') return p.archived;
    if (statusFilter === 'active') return !p.archived && p.status === 'active';
    if (statusFilter === 'draft') return !p.archived && p.status === 'draft';
    if (statusFilter === 'all') return !p.archived;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-light">Products</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary !py-2.5 !px-5 text-xs">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white">
          <option value="all">All Active</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-light text-xs text-ink-400 uppercase tracking-wider">
            <tr>
              <th className="text-left p-4 font-medium">Product</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
              <th className="text-left p-4 font-medium">Price</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Stock</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-ink-400">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-ink-400">No products found.</td></tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.id} className={`border-t border-ink-50 hover:bg-stone-light/50 ${p.archived ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.featured_image || ''} alt={p.name} className="w-10 h-12 object-cover bg-ink-50" />
                      <div>
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.sku || 'No SKU'}{p.has_variants ? ' · Variants' : ''}{p.archived ? ' · Archived' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-ink-500">{p.category?.name || '—'}</td>
                  <td className="p-4">{formatPrice(p.sale_price || p.regular_price)}</td>
                  <td className="p-4 hidden sm:table-cell">{p.stock_quantity}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-1 ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 hover:bg-ink-100 transition-colors" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDuplicate(p)} className="p-1.5 hover:bg-ink-100 transition-colors" aria-label="Duplicate"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => handleArchive(p)} className="p-1.5 hover:bg-ink-100 transition-colors" aria-label={p.archived ? 'Restore' : 'Archive'}>
                        {p.archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 text-red-500 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editing}
            categories={categories}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSaved={() => { loadProducts(); setShowForm(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="This will permanently delete the product and all its variants and images. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

// ============ PRODUCT FORM with Gallery + Variants ============
function ProductForm({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    category_id: product?.category_id || '',
    brand: product?.brand || '',
    product_type: product?.product_type || '',
    short_description: product?.short_description || '',
    long_description: product?.long_description || '',
    regular_price: product?.regular_price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    cost_price: product?.cost_price?.toString() || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    low_stock_threshold: product?.low_stock_threshold?.toString() || '5',
    sku: product?.sku || '',
    weight: product?.weight?.toString() || '',
    fabric_type: product?.fabric_type || '',
    material: product?.material || '',
    care_instructions: product?.care_instructions || '',
    country_of_origin: product?.country_of_origin || '',
    featured_image: product?.featured_image || '',
    homepage_section: product?.homepage_section || 'none',
    status: product?.status || 'active',
    has_variants: product?.has_variants || false,
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
    meta_keywords: product?.meta_keywords || '',
  });
  const [gallery, setGallery] = useState<ProductImage[]>([]);
  const [variantGroups, setVariantGroups] = useState<ProductVariantGroup[]>([]);
  const [combinations, setCombinations] = useState<ProductVariantCombination[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState<'basic' | 'images' | 'variants' | 'seo'>('basic');

  useEffect(() => {
    if (!product) return;
    (async () => {
      const [{ data: imgs }, { data: vgs }, { data: combos }] = await Promise.all([
        supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order'),
        supabase.from('product_variant_groups').select('*, product_variant_values(*)').eq('product_id', product.id).order('sort_order'),
        supabase.from('product_variant_combinations').select('*').eq('product_id', product.id),
      ]);
      setGallery((imgs || []) as ProductImage[]);
      setVariantGroups((vgs || []) as ProductVariantGroup[]);
      setCombinations((combos || []) as ProductVariantCombination[]);
    })();
  }, [product]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
    await supabase.from('media_assets').insert({ url: data.publicUrl, file_name: file.name, file_path: fileName, content_type: file.type, file_size: file.size });
    return data.publicUrl;
  };

  const handleFeaturedUpload = async (file: File) => {
    setUploading(true);
    try { const url = await uploadImage(file); setForm({ ...form, featured_image: url }); toast.success('Image uploaded.'); } catch { toast.error('Upload failed.'); }
    setUploading(false);
  };

  const handleGalleryUpload = async (file: File) => {
    if (!product) { toast.error('Save the product first before adding gallery images.'); return; }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      const { data } = await supabase.from('product_images').insert({ product_id: product.id, image_url: url, sort_order: gallery.length }).select().single();
      if (data) setGallery([...gallery, data as ProductImage]);
      toast.success('Gallery image added.');
    } catch { toast.error('Upload failed.'); }
    setUploading(false);
  };

  const moveGalleryImage = async (idx: number, dir: 'up' | 'down') => {
    const newGallery = [...gallery];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= newGallery.length) return;
    [newGallery[idx], newGallery[target]] = [newGallery[target], newGallery[idx]];
    newGallery.forEach((img, i) => { img.sort_order = i; });
    setGallery(newGallery);
    for (const img of newGallery) {
      await supabase.from('product_images').update({ sort_order: img.sort_order }).eq('id', img.id);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    await supabase.from('product_images').delete().eq('id', id);
    setGallery(gallery.filter((g) => g.id !== id));
    toast.success('Image removed.');
  };

  // Variant management
  const addVariantGroup = async () => {
    if (!product) { toast.error('Save the product first.'); return; }
    const name = prompt('Variant group name (e.g. Size, Design, Color):');
    if (!name) return;
    const { data } = await supabase.from('product_variant_groups').insert({ product_id: product.id, name, sort_order: variantGroups.length }).select('*, product_variant_values(*)').single();
    if (data) { setVariantGroups([...variantGroups, data as ProductVariantGroup]); toast.success('Variant group added.'); }
  };

  const deleteVariantGroup = async (groupId: string) => {
    if (!confirm('Delete this variant group and all its values?')) return;
    await supabase.from('product_variant_groups').delete().eq('id', groupId);
    setVariantGroups(variantGroups.filter((g) => g.id !== groupId));
    toast.success('Variant group deleted.');
  };

  const addVariantValue = async (groupId: string) => {
    const value = prompt('Value (e.g. 2 Meter, Royal Check):');
    if (!value) return;
    const group = variantGroups.find((g) => g.id === groupId);
    const sortOrder = group?.product_variant_values?.length || 0;
    const { data } = await supabase.from('product_variant_values').insert({ group_id: groupId, value, sort_order: sortOrder }).select().single();
    if (data) {
      setVariantGroups(variantGroups.map((g) => g.id === groupId ? { ...g, product_variant_values: [...(g.product_variant_values || []), data as any] } : g));
      toast.success('Value added.');
    }
  };

  const deleteVariantValue = async (groupId: string, valueId: string) => {
    await supabase.from('product_variant_values').delete().eq('id', valueId);
    setVariantGroups(variantGroups.map((g) => g.id === groupId ? { ...g, product_variant_values: (g.product_variant_values || []).filter((v) => v.id !== valueId) } : g));
    toast.success('Value removed.');
  };

  const generateCombinations = async () => {
    if (!product) return;
    const groups = variantGroups.filter((g) => (g.product_variant_values || []).length > 0);
    if (groups.length === 0) { toast.error('Add at least one group with values.'); return; }
    if (!confirm('This will regenerate all combinations. Existing custom prices/stock will be replaced. Continue?')) return;

    // Delete old combos
    await supabase.from('product_variant_combinations').delete().eq('product_id', product.id);

    // Generate all combinations
    const valueLists = groups.map((g) => (g.product_variant_values || []).map((v) => v.value));
    const combos: string[][] = valueLists.reduce((acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])), [[]] as string[][]);

    const rows = combos.map((combo) => ({
      product_id: product.id,
      combination_key: combo.join('|'),
      regular_price: parseFloat(form.regular_price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock_quantity: 0,
      sku: '',
      status: 'active',
    }));

    const { data } = await supabase.from('product_variant_combinations').insert(rows).select('*');
    if (data) { setCombinations(data as ProductVariantCombination[]); toast.success(`${data.length} combinations generated.`); }
  };

  const updateCombination = async (id: string, field: string, value: string | number | null) => {
    const val = field === 'sale_price' && value === '' ? null : value;
    setCombinations(combinations.map((c) => c.id === id ? { ...c, [field]: val } as any : c));
  };

  const saveCombination = async (c: ProductVariantCombination) => {
    await supabase.from('product_variant_combinations').update({
      regular_price: c.regular_price,
      sale_price: c.sale_price,
      stock_quantity: c.stock_quantity,
      sku: c.sku,
      status: c.status,
    }).eq('id', c.id);
    toast.success('Combination saved.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = {
      ...form,
      slug,
      category_id: form.category_id || null,
      regular_price: parseFloat(form.regular_price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      weight: form.weight ? parseFloat(form.weight) : null,
      archived: false,
    };

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      if (error) { toast.error('Failed to update.'); setSaving(false); return; }
      toast.success('Product updated.');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast.error('Failed to create.'); setSaving(false); return; }
      toast.success('Product created.');
    }
    setSaving(false);
    onSaved();
  };

  const sections = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'images', label: 'Images' },
    { key: 'variants', label: 'Variants' },
    { key: 'seo', label: 'SEO' },
  ] as const;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-ink-900/50 z-[80]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white z-[90] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100 z-10">
          <h2 className="font-display text-2xl font-light">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-ink-100 bg-stone-light">
          {sections.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)} className={`px-3 py-1.5 text-xs transition-colors ${section === s.key ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
          {section === 'basic' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-ink-400 block mb-1">Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="input-field" /></div>
                <div><label className="text-xs text-ink-400 block mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-ink-400 block mb-1">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-ink-400 block mb-1">Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" /></div>
                <div><label className="text-xs text-ink-400 block mb-1">Product Type</label><input value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="text-xs text-ink-400 block mb-1">Short Description</label><input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs text-ink-400 block mb-1">Long Description</label><textarea rows={4} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} className="input-field resize-none" /></div>

              <div className="border-t border-ink-100 pt-4">
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4 text-ink-400">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-xs text-ink-400 block mb-1">Regular Price *</label><input type="number" required value={form.regular_price} onChange={(e) => setForm({ ...form, regular_price: e.target.value })} className="input-field" /></div>
                  <div><label className="text-xs text-ink-400 block mb-1">Sale Price</label><input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="input-field" /></div>
                  <div><label className="text-xs text-ink-400 block mb-1">Cost Price</label><input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="input-field" /></div>
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4 text-ink-400">Inventory</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-xs text-ink-400 block mb-1">SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field" /></div>
                  <div><label className="text-xs text-ink-400 block mb-1">Stock Quantity</label><input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="input-field" /></div>
                  <div><label className="text-xs text-ink-400 block mb-1">Low Stock Threshold</label><input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} className="input-field" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-xs text-ink-400 block mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-ink-400 block mb-1">Homepage Section</label>
                    <select value={form.homepage_section} onChange={(e) => setForm({ ...form, homepage_section: e.target.value })} className="input-field">
                      <option value="none">None</option>
                      <option value="featured">Featured Products</option>
                      <option value="new_arrival">New Arrivals</option>
                      <option value="best_seller">Best Sellers</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>
                  <div><label className="text-xs text-ink-400 block mb-1">Weight (g)</label><input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" /></div>
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4 text-ink-400">Attributes</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-xs text-ink-400 block mb-1">Fabric Type</label><input value={form.fabric_type} onChange={(e) => setForm({ ...form, fabric_type: e.target.value })} className="input-field" /></div>
                  <div><label className="text-xs text-ink-400 block mb-1">Material</label><input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input-field" /></div>
                  <div><label className="text-xs text-ink-400 block mb-1">Country of Origin</label><input value={form.country_of_origin} onChange={(e) => setForm({ ...form, country_of_origin: e.target.value })} className="input-field" /></div>
                </div>
                <div className="mt-4"><label className="text-xs text-ink-400 block mb-1">Care Instructions</label><input value={form.care_instructions} onChange={(e) => setForm({ ...form, care_instructions: e.target.value })} className="input-field" /></div>
              </div>
            </>
          )}

          {section === 'images' && (
            <>
              <div>
                <label className="text-xs text-ink-400 block mb-2">Featured Image</label>
                {form.featured_image && <img src={form.featured_image} alt="Preview" className="w-32 h-40 object-cover mb-2 bg-ink-50" />}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFeaturedUpload(e.target.files[0])} disabled={uploading} className="text-xs" />
                {form.featured_image && <button type="button" onClick={() => setForm({ ...form, featured_image: '' })} className="block text-xs text-red-500 mt-1">Remove</button>}
              </div>

              <div className="border-t border-ink-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs tracking-widest uppercase font-medium text-ink-400">Gallery Images</h3>
                  {product && (
                    <label className="cursor-pointer">
                      <span className="text-xs flex items-center gap-1 text-ink-500 hover:text-ink-900"><Plus className="w-3 h-3" /> Add Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleGalleryUpload(e.target.files[0])} disabled={uploading} />
                    </label>
                  )}
                </div>
                {!product && <p className="text-xs text-ink-400">Save the product first to add gallery images.</p>}
                {gallery.length > 0 && (
                  <div className="space-y-2">
                    {gallery.map((img, idx) => (
                      <div key={img.id} className="flex items-center gap-3 p-2 border border-ink-100">
                        <GripVertical className="w-4 h-4 text-ink-300" />
                        <img src={img.image_url} alt="" className="w-12 h-16 object-cover bg-ink-50" />
                        <span className="text-xs text-ink-400 flex-1">Image {idx + 1}</span>
                        <button type="button" onClick={() => moveGalleryImage(idx, 'up')} disabled={idx === 0} className="p-1 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveGalleryImage(idx, 'down')} disabled={idx === gallery.length - 1} className="p-1 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                        <button type="button" onClick={() => deleteGalleryImage(img.id)} className="p-1 text-red-500"><Trash className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {section === 'variants' && (
            <>
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
                <input type="checkbox" checked={form.has_variants} onChange={(e) => setForm({ ...form, has_variants: e.target.checked })} className="accent-ink-900" />
                This product has variants (size, design, color, etc.)
              </label>

              {form.has_variants ? (
                <>
                  {!product && <p className="text-xs text-amber-600 bg-amber-50 p-3">Save the product first to manage variants.</p>}

                  {product && (
                    <>
                      {/* Variant Groups */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs tracking-widest uppercase font-medium text-ink-400">Variant Groups</h3>
                          <button type="button" onClick={addVariantGroup} className="text-xs flex items-center gap-1 text-ink-500 hover:text-ink-900"><Plus className="w-3 h-3" /> Add Group</button>
                        </div>
                        {variantGroups.map((group) => (
                          <div key={group.id} className="border border-ink-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium">{group.name}</span>
                              <button type="button" onClick={() => deleteVariantGroup(group.id)} className="text-xs text-red-500">Delete</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(group.product_variant_values || []).map((val) => (
                                <span key={val.id} className="flex items-center gap-1 px-2 py-1 bg-stone-light text-xs">
                                  {val.value}
                                  <button type="button" onClick={() => deleteVariantValue(group.id, val.id)} className="text-ink-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                                </span>
                              ))}
                            </div>
                            <button type="button" onClick={() => addVariantValue(group.id)} className="text-xs text-ink-500 hover:text-ink-900 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Value</button>
                          </div>
                        ))}
                      </div>

                      {/* Combinations */}
                      {variantGroups.some((g) => (g.product_variant_values || []).length > 0) && (
                        <div className="border-t border-ink-100 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs tracking-widest uppercase font-medium text-ink-400 flex items-center gap-2"><Layers className="w-3 h-3" /> Combinations</h3>
                            <button type="button" onClick={generateCombinations} className="text-xs btn-outline !py-1.5 !px-3">Generate All</button>
                          </div>
                          {combinations.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {combinations.map((c) => (
                                <div key={c.id} className="grid grid-cols-6 gap-2 items-center p-2 border border-ink-100 text-xs">
                                  <span className="col-span-2 truncate font-medium" title={c.combination_key}>{c.combination_key}</span>
                                  <input type="number" placeholder="Reg Price" value={c.regular_price} onChange={(e) => updateCombination(c.id, 'regular_price', parseFloat(e.target.value) || 0)} className="w-full px-1 py-1 border border-ink-200" />
                                  <input type="number" placeholder="Sale" value={c.sale_price ?? ''} onChange={(e) => updateCombination(c.id, 'sale_price', e.target.value)} className="w-full px-1 py-1 border border-ink-200" />
                                  <input type="number" placeholder="Stock" value={c.stock_quantity} onChange={(e) => updateCombination(c.id, 'stock_quantity', parseInt(e.target.value) || 0)} className="w-full px-1 py-1 border border-ink-200" />
                                  <button type="button" onClick={() => saveCombination(c)} className="px-2 py-1 bg-ink-900 text-white text-[10px]">Save</button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-ink-400">Click "Generate All" to create combinations from variant groups.</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-xs text-ink-400">Enable the checkbox above to configure variants.</p>
              )}
            </>
          )}

          {section === 'seo' && (
            <>
              <div><label className="text-xs text-ink-400 block mb-1">SEO Title</label><input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs text-ink-400 block mb-1">SEO Description</label><textarea rows={3} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} className="input-field resize-none" /></div>
              <div><label className="text-xs text-ink-400 block mb-1">Meta Keywords</label><input value={form.meta_keywords} onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })} className="input-field" /></div>
            </>
          )}

          <div className="sticky bottom-0 bg-white flex gap-3 pt-4 border-t border-ink-100 -mx-6 px-6 -mb-6 pb-6">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Product'}</button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
