import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import type { Coupon } from '../../types';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data || []) as Coupon[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    toast.success('Coupon deleted.');
    loadCoupons();
  };

  const toggleEnabled = async (c: Coupon) => {
    await supabase.from('coupons').update({ is_enabled: !c.is_enabled }).eq('id', c.id);
    loadCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-light">Coupons</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary !py-2.5 !px-5 text-xs">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-white border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-light text-xs text-ink-400 uppercase tracking-wider">
            <tr>
              <th className="text-left p-4 font-medium">Code</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Value</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Min Purchase</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Expiry</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-ink-400">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-ink-400">No coupons yet.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-t border-ink-50 hover:bg-stone-light/50">
                  <td className="p-4 font-medium">{c.code}</td>
                  <td className="p-4 text-ink-500 capitalize">{c.discount_type}</td>
                  <td className="p-4">{c.discount_type === 'percentage' ? `${c.discount_value}%` : formatPrice(c.discount_value)}</td>
                  <td className="p-4 hidden md:table-cell text-ink-500">{formatPrice(c.minimum_purchase)}</td>
                  <td className="p-4 hidden lg:table-cell text-ink-400">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
                  <td className="p-4">
                    <button onClick={() => toggleEnabled(c)} className={`text-xs px-2 py-1 ${c.is_enabled ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                      {c.is_enabled ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 hover:bg-ink-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <CouponForm coupon={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { loadCoupons(); setShowForm(false); setEditing(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CouponForm({ coupon, onClose, onSaved }: { coupon: Coupon | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value?.toString() || '',
    expiry_date: coupon?.expiry_date ? coupon.expiry_date.slice(0, 10) : '',
    minimum_purchase: coupon?.minimum_purchase?.toString() || '0',
    maximum_discount: coupon?.maximum_discount?.toString() || '',
    usage_limit: coupon?.usage_limit?.toString() || '',
    one_time_use: coupon?.one_time_use || false,
    is_enabled: coupon?.is_enabled ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      discount_value: parseFloat(form.discount_value) || 0,
      minimum_purchase: parseFloat(form.minimum_purchase) || 0,
      maximum_discount: form.maximum_discount ? parseFloat(form.maximum_discount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
    };
    if (coupon) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', coupon.id);
      if (error) toast.error('Failed to update.'); else toast.success('Coupon updated.');
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) toast.error('Failed to create.'); else toast.success('Coupon created.');
    }
    setSaving(false);
    onSaved();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-ink-900/50 z-[80]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[90] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100">
          <h2 className="font-display text-2xl font-light">{coupon ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="text-xs text-ink-400 block mb-1">Code *</label><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field uppercase" /></div>
          <div>
            <label className="text-xs text-ink-400 block mb-1">Discount Type</label>
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-field">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div><label className="text-xs text-ink-400 block mb-1">Discount Value *</label><input type="number" required value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Minimum Purchase</label><input type="number" value={form.minimum_purchase} onChange={(e) => setForm({ ...form, minimum_purchase: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Maximum Discount (optional)</label><input type="number" value={form.maximum_discount} onChange={(e) => setForm({ ...form, maximum_discount: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Expiry Date</label><input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs text-ink-400 block mb-1">Usage Limit (optional)</label><input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="input-field" /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.one_time_use} onChange={(e) => setForm({ ...form, one_time_use: e.target.checked })} className="accent-ink-900" /> One-time use only
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} className="accent-ink-900" /> Enabled
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
