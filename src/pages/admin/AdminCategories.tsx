import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, ChevronUp, ChevronDown, FolderTree, CornerDownRight, Tag } from 'lucide-react';
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
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) {
      console.error('Error fetching categories:', error);
    }
    const cats = (data || []) as Category[];
    // Get product counts
    const withCounts = await Promise.all(
      cats.map(async (c) => {
        const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('archived', false);
        return { ...c, product_count: count || 0 };
      })
    );
    setCategories(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    if (error) toast.error('Failed to delete category.');
    else {
      toast.success('Category deleted.');
      loadCategories();
    }
    setDeleteId(null);
  };

  const toggleVisible = async (cat: Category) => {
    await supabase.from('categories').update({ is_visible: !cat.is_visible }).eq('id', cat.id);
    loadCategories();
  };

  const moveCategory = async (idx: number, dir: 'up' | 'down', list: Category[]) => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    const newList = [...list];
    [newList[idx], newList[target]] = [newList[target], newList[idx]];
    newList.forEach((c, i) => {
      c.sort_order = i + 1;
    });
    for (const c of newList) {
      await supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id);
    }
    loadCategories();
  };

  // Group top-level categories and their sub-categories
  const parentCategories = categories.filter((c) => !c.parent_id);
  const orphanSubcategories = categories.filter((c) => c.parent_id && !categories.some((p) => p.id === c.parent_id));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">Categories</h1>
          <p className="text-xs text-ink-400 mt-1">Manage main categories and nested sub-categories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setDefaultParentId(null);
              setShowForm(true);
            }}
            className="btn-primary !py-2.5 !px-5 text-xs"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading categories...</p>
      ) : parentCategories.length === 0 && orphanSubcategories.length === 0 ? (
        <div className="bg-white border border-ink-100 p-8 text-center">
          <FolderTree className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-sm text-ink-600 font-medium mb-1">No categories created yet</p>
          <p className="text-xs text-ink-400 mb-4">Create parent categories like "Shawls" or "Tweed Fabric" to start.</p>
          <button
            onClick={() => {
              setEditing(null);
              setDefaultParentId(null);
              setShowForm(true);
            }}
            className="btn-primary !py-2 !px-4 text-xs"
          >
            <Plus className="w-4 h-4" /> Add Main Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {parentCategories.map((parent, pIdx) => {
            const subcats = categories.filter((c) => c.parent_id === parent.id);
            const totalProducts = (parent.product_count || 0) + subcats.reduce((sum, s) => sum + (s.product_count || 0), 0);

            return (
              <div key={parent.id} className="bg-white border border-ink-200 rounded-sm overflow-hidden shadow-sm">
                {/* Main Category Header Bar */}
                <div className="p-4 bg-stone-light/40 border-b border-ink-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {parent.thumbnail ? (
                      <img src={parent.thumbnail} alt={parent.name} className="w-12 h-12 object-cover bg-ink-50 rounded-sm border border-ink-200" />
                    ) : (
                      <div className="w-12 h-12 bg-ink-100 flex items-center justify-center text-ink-500 rounded-sm">
                        <FolderTree className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-ink-900">{parent.name}</h2>
                        <span className="text-[10px] tracking-wider uppercase bg-ink-900 text-white px-2 py-0.5 font-medium rounded-full">
                          Parent Category
                        </span>
                        {!parent.is_visible && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 font-medium rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-400">
                        /{parent.slug} &bull; <span className="font-medium text-ink-700">{totalProducts} products</span> ({subcats.length} sub-categories)
                      </p>
                    </div>
                  </div>

                  {/* Actions for Parent Category */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(null);
                        setDefaultParentId(parent.id);
                        setShowForm(true);
                      }}
                      className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1 hover:bg-ink-900 hover:text-white transition-colors"
                      title="Add subcategory inside this parent"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Sub-category
                    </button>
                    <div className="flex items-center border-l border-ink-200 pl-2 gap-1">
                      <button
                        onClick={() => moveCategory(pIdx, 'up', parentCategories)}
                        disabled={pIdx === 0}
                        className="p-1.5 text-ink-400 hover:text-ink-900 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveCategory(pIdx, 'down', parentCategories)}
                        disabled={pIdx === parentCategories.length - 1}
                        className="p-1.5 text-ink-400 hover:text-ink-900 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleVisible(parent)} className="p-1.5 text-ink-400 hover:text-ink-900">
                        {parent.is_visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-ink-300" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(parent);
                          setDefaultParentId(null);
                          setShowForm(true);
                        }}
                        className="p-1.5 text-ink-400 hover:text-ink-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(parent.id)} className="p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-categories List */}
                <div className="p-4 bg-white">
                  {subcats.length === 0 ? (
                    <div className="py-3 px-4 bg-stone-50 border border-dashed border-ink-200 rounded text-center">
                      <p className="text-xs text-ink-400">
                        No sub-categories in <span className="font-medium">{parent.name}</span>. Click{' '}
                        <button
                          onClick={() => {
                            setEditing(null);
                            setDefaultParentId(parent.id);
                            setShowForm(true);
                          }}
                          className="text-ink-900 underline font-medium"
                        >
                          Add Sub-category
                        </button>{' '}
                        to create one.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subcats.map((sub, sIdx) => (
                        <div
                          key={sub.id}
                          className="border border-ink-100 hover:border-ink-300 rounded p-3 bg-stone-50/50 flex flex-col justify-between transition-colors"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="w-4 h-4 text-ink-400 shrink-0" />
                                {sub.thumbnail ? (
                                  <img src={sub.thumbnail} alt={sub.name} className="w-8 h-8 object-cover bg-white rounded border border-ink-200" />
                                ) : (
                                  <div className="w-8 h-8 bg-ink-100 flex items-center justify-center text-ink-400 rounded">
                                    <Tag className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-xs font-semibold text-ink-900">{sub.name}</h3>
                                  <p className="text-[11px] text-ink-400">/{sub.slug}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => toggleVisible(sub)} title="Toggle visibility">
                                  {sub.is_visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-ink-300" />}
                                </button>
                              </div>
                            </div>
                            {sub.description && <p className="text-[11px] text-ink-500 line-clamp-2 mb-2 pl-6">{sub.description}</p>}
                          </div>

                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-ink-100/80 text-xs">
                            <span className="text-[11px] text-ink-400 font-medium">{sub.product_count} products</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveCategory(sIdx, 'up', subcats)}
                                disabled={sIdx === 0}
                                className="p-1 text-ink-400 hover:text-ink-900 disabled:opacity-20"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveCategory(sIdx, 'down', subcats)}
                                disabled={sIdx === subcats.length - 1}
                                className="p-1 text-ink-400 hover:text-ink-900 disabled:opacity-20"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditing(sub);
                                  setDefaultParentId(sub.parent_id);
                                  setShowForm(true);
                                }}
                                className="p-1 text-ink-600 hover:text-ink-900"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleteId(sub.id)} className="p-1 text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {orphanSubcategories.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-sm p-4">
              <h2 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Unassigned Sub-categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orphanSubcategories.map((sub) => (
                  <div key={sub.id} className="border border-amber-100 p-3 bg-amber-50/50 rounded flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-ink-900">{sub.name}</p>
                      <p className="text-[10px] text-ink-400">/{sub.slug}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditing(sub);
                        setDefaultParentId(null);
                        setShowForm(true);
                      }}
                      className="btn-outline !py-1 !px-2 text-[11px]"
                    >
                      Assign Parent
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CategoryForm
            category={editing}
            categories={categories}
            defaultParentId={defaultParentId}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
              setDefaultParentId(null);
            }}
            onSaved={() => {
              loadCategories();
              setShowForm(false);
              setEditing(null);
              setDefaultParentId(null);
            }}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        message="Products linked to this category will remain, but will lose their category association. Sub-categories attached to this parent will also be affected. Proceed?"
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function CategoryForm({
  category,
  categories,
  defaultParentId,
  onClose,
  onSaved,
}: {
  category: Category | null;
  categories: Category[];
  defaultParentId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialParentId = category ? category.parent_id : defaultParentId;
  const [isSubcategory, setIsSubcategory] = useState<boolean>(!!initialParentId);
  const [parentId, setParentId] = useState<string>(initialParentId || '');
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

  // Available top-level parents for subcategory dropdown
  const parentOptions = categories.filter((c) => !c.parent_id && c.id !== category?.id);

  const handleUpload = async (file: File, field: 'banner_image' | 'thumbnail') => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
    if (error) {
      toast.error('Upload failed.');
      return;
    }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
    await supabase.from('media_assets').insert({
      url: data.publicUrl,
      file_name: file.name,
      file_path: fileName,
      content_type: file.type,
      file_size: file.size,
    });
    setForm({ ...form, [field]: data.publicUrl });
    toast.success('Image uploaded.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubcategory && !parentId) {
      toast.error('Please select a parent category for this sub-category.');
      return;
    }

    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = {
      ...form,
      slug,
      parent_id: isSubcategory ? parentId || null : null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (category) {
      const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
      if (error) {
        toast.error('Failed to update category.');
        console.error('Update category error:', error);
      } else {
        toast.success('Category updated.');
        onSaved();
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        toast.error('Failed to create category.');
        console.error('Create category error:', error);
      } else {
        toast.success('Category created.');
        onSaved();
      }
    }
    setSaving(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-ink-900/50 z-[80]" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[90] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100 z-10">
          <div>
            <h2 className="font-display text-2xl font-light">{category ? 'Edit Category' : 'New Category'}</h2>
            <p className="text-xs text-ink-400">{isSubcategory ? 'Creating sub-category' : 'Creating main category'}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subcategory Checkbox */}
          <div className="bg-stone-light/60 p-3.5 border border-ink-200 rounded-sm">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isSubcategory}
                onChange={(e) => {
                  setIsSubcategory(e.target.checked);
                  if (!e.target.checked) setParentId('');
                }}
                className="w-4 h-4 accent-ink-900"
              />
              <span>This is a Sub-category</span>
            </label>

            {isSubcategory && (
              <div className="mt-3 pt-3 border-t border-ink-200">
                <label className="text-xs font-medium text-ink-700 block mb-1">Select Parent Category *</label>
                <select
                  required={isSubcategory}
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="input-field bg-white"
                >
                  <option value="">-- Choose Parent Category --</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {parentOptions.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">No top-level categories available. Create a main category first.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-ink-400 block mb-1">Category Name *</label>
            <input
              required
              placeholder={isSubcategory ? 'e.g. Kashmir Shawl, Woolen Shawl' : 'e.g. Shawls, Tweed Fabric'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: isSlugManuallyEdited ? form.slug : slugify(e.target.value) })}
              className="input-field"
            />
          </div>

          <div>
            <label className="text-xs text-ink-400 block mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setForm({ ...form, slug: e.target.value });
              }}
              className="input-field"
            />
          </div>

          <div>
            <label className="text-xs text-ink-400 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
          </div>

          <div>
            <label className="text-xs text-ink-400 block mb-2">Thumbnail</label>
            {form.thumbnail && <img src={form.thumbnail} alt="Thumbnail" className="w-20 h-20 object-cover mb-2 bg-ink-50 rounded border" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'thumbnail')} className="text-xs" />
          </div>

          <div>
            <label className="text-xs text-ink-400 block mb-2">Banner Image</label>
            {form.banner_image && <img src={form.banner_image} alt="Banner" className="w-full h-32 object-cover mb-2 bg-ink-50 rounded border" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner_image')} className="text-xs" />
          </div>

          <div>
            <label className="text-xs text-ink-400 block mb-1">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="accent-ink-900" />{' '}
            Visible on storefront
          </label>

          <div className="border-t border-ink-100 pt-4">
            <h3 className="text-xs tracking-widest uppercase font-medium mb-4 text-ink-400">SEO</h3>
            <div>
              <label className="text-xs text-ink-400 block mb-1">SEO Title</label>
              <input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="input-field" />
            </div>
            <div className="mt-3">
              <label className="text-xs text-ink-400 block mb-1">SEO Description</label>
              <textarea rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} className="input-field resize-none" />
            </div>
            <div className="mt-3">
              <label className="text-xs text-ink-400 block mb-1">Meta Keywords</label>
              <input value={form.meta_keywords} onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })} className="input-field" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Category'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
