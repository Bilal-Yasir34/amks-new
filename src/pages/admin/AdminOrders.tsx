import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, XCircle, ExternalLink, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Confirmation',
  confirmed: 'In Progress',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    setOrders((data || []) as Order[]);
    setLoading(false);
  };

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.order_number.toLowerCase().includes(q) && !o.customer_name.toLowerCase().includes(q) && !o.customer_email.toLowerCase().includes(q)) return false;
    }
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update.'); else { toast.success('Order status updated.'); loadOrders(); }
  };

  const handleDeleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete order.');
    } else {
      toast.success('Order deleted.');
      setSelected(null);
      loadOrders();
    }
  };

  const updatePaymentStatus = async (order: Order, paymentStatus: string, notes?: string) => {
    const payload: any = { payment_status: paymentStatus };
    if (paymentStatus === 'verified') { payload.verified_by = user?.id; payload.verified_date = new Date().toISOString(); }
    if (notes !== undefined) payload.verification_notes = notes;
    const { error } = await supabase.from('orders').update(payload).eq('id', order.id);
    if (error) toast.error('Failed to update.'); else { toast.success('Payment status updated.'); loadOrders(); setSelected({ ...order, ...payload }); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light mb-8">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input type="text" placeholder="Search by order #, name, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-light text-xs text-ink-400 uppercase tracking-wider">
            <tr>
              <th className="text-left p-4 font-medium">Order #</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Payment</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
              <th className="text-right p-4 font-medium">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-ink-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-ink-400">No orders found.</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t border-ink-50 hover:bg-stone-light/50 cursor-pointer" onClick={() => setSelected(o)}>
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-2">
                      {o.order_number}
                      {o.payment_screenshot && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title="Payment screenshot attached">
                          <ImageIcon className="w-3 h-3" /> Receipt
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-ink-500">{o.customer_name}</td>
                  <td className="p-4">{formatPrice(o.total)}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-1 rounded ${o.payment_status === 'verified' ? 'bg-green-100 text-green-700' : o.payment_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {o.payment_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-ink-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right text-ink-400">→</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-ink-900/50 z-[80]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[90] overflow-y-auto">
              <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100 z-10">
                <div>
                  <h2 className="font-display text-2xl font-light">{selected.order_number}</h2>
                  <p className="text-xs text-ink-400">Placed on {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-stone-light"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer */}
                <div className="bg-stone-light/40 p-4 rounded border border-ink-100">
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Customer Information</h3>
                  <p className="text-sm font-medium text-ink-900">{selected.customer_name}</p>
                  <p className="text-sm text-ink-500">{selected.customer_email}</p>
                  <p className="text-sm text-ink-500">{selected.customer_phone}</p>
                </div>

                {/* Shipping */}
                <div className="bg-stone-light/40 p-4 rounded border border-ink-100">
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Shipping Address</h3>
                  <p className="text-sm text-ink-900">{selected.shipping_address}</p>
                  <p className="text-sm text-ink-500">{selected.city}{selected.postal_code ? `, ${selected.postal_code}` : ''}</p>
                  {selected.order_notes && <p className="text-sm text-ink-600 mt-2 bg-amber-50 p-2.5 rounded border border-amber-100"><span className="font-medium text-amber-900">Notes:</span> {selected.order_notes}</p>}
                </div>

                {/* Items */}
                <div className="bg-stone-light/40 p-4 rounded border border-ink-100">
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Order Items</h3>
                  <div className="space-y-3">
                    {selected.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        {item.image_url && <img src={item.image_url} alt="" className="w-12 h-14 object-cover bg-white rounded shrink-0 border border-ink-100" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink-900 truncate">{item.product_name}</p>
                          {item.variant_description && <p className="text-xs text-ink-500">{item.variant_description}</p>}
                          <p className="text-xs text-ink-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-medium text-ink-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-ink-200 space-y-1.5 text-sm">
                    <div className="flex justify-between text-ink-500"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                    {selected.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount {selected.coupon_code ? `(${selected.coupon_code})` : ''}</span><span>-{formatPrice(selected.discount)}</span></div>}
                    <div className="flex justify-between text-ink-500"><span>Shipping</span><span>{selected.shipping === 0 ? 'Free' : formatPrice(selected.shipping)}</span></div>
                    <div className="flex justify-between font-medium pt-2 border-t border-ink-200 text-ink-900 text-base"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
                  </div>
                </div>

                {/* Payment & Screenshot proof */}
                <div className="bg-stone-light/40 p-4 rounded border border-ink-100 space-y-4">
                  <h3 className="text-xs tracking-widest uppercase font-medium text-ink-400">Payment Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-ink-400 block">Payment Method</span>
                      <span className="font-medium text-ink-900">{selected.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-ink-400 block">Verification Status</span>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded capitalize ${selected.payment_status === 'verified' ? 'bg-green-100 text-green-800' : selected.payment_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {selected.payment_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {selected.transaction_id && (
                    <div>
                      <span className="text-xs text-ink-400 block">Transaction Reference / ID</span>
                      <span className="font-mono text-sm font-medium text-ink-900 bg-white px-2.5 py-1 rounded border border-ink-100 inline-block mt-0.5">
                        {selected.transaction_id}
                      </span>
                    </div>
                  )}

                  {/* Payment Screenshot Preview */}
                  {selected.payment_screenshot ? (
                    <div className="mt-4 pt-4 border-t border-ink-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-ink-700 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-600" /> Payment Receipt / Screenshot
                        </span>
                        <a
                          href={selected.payment_screenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                        >
                          Open Original <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="relative group overflow-hidden rounded-lg border border-ink-200 bg-black/5 max-w-sm">
                        <img
                          src={selected.payment_screenshot}
                          alt="Payment proof screenshot"
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setScreenshotModalUrl(selected.payment_screenshot)}
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshotModalUrl(selected.payment_screenshot)}
                          className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-2"
                        >
                          <ZoomIn className="w-5 h-5" /> Click to Enlarge
                        </button>
                      </div>
                    </div>
                  ) : (
                    selected.payment_method === 'bank_transfer' && (
                      <p className="text-xs text-amber-700 italic bg-amber-50 p-2.5 rounded border border-amber-100 mt-2">
                        No payment screenshot was uploaded by the customer for this bank transfer order.
                      </p>
                    )
                  )}

                  {selected.verification_notes && <p className="text-sm text-ink-600 bg-white p-2.5 rounded border border-ink-100">Verification Note: {selected.verification_notes}</p>}
                  {selected.verified_date && <p className="text-xs text-ink-400">Verified at: {new Date(selected.verified_date).toLocaleString()}</p>}

                  {/* Payment status actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => updatePaymentStatus(selected, 'verified')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" /> Verify Payment
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(selected, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject Payment
                    </button>
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-stone-light/40 p-4 rounded border border-ink-100">
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Update Order Status</h3>
                  <select value={selected.status} onChange={(e) => { updateStatus(selected.id, e.target.value); setSelected({ ...selected, status: e.target.value }); }} className="input-field">
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
                  </select>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-red-100">
                  <button
                    onClick={() => setDeleteId(selected.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors font-medium rounded"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Resolution Payment Screenshot Lightbox Modal */}
      <AnimatePresence>
        {screenshotModalUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setScreenshotModalUrl(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-full flex justify-between items-center mb-3 text-white">
                <span className="text-sm font-medium">Payment Proof Screenshot</span>
                <div className="flex items-center gap-3">
                  <a
                    href={screenshotModalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-300 hover:underline flex items-center gap-1"
                  >
                    Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setScreenshotModalUrl(null)}
                    className="p-1 rounded-full hover:bg-white/20 text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-auto max-h-[80vh] w-full flex justify-center bg-black/40 rounded-lg p-2 border border-white/10">
                <img src={screenshotModalUrl} alt="Payment proof high resolution" className="max-w-full max-h-[75vh] object-contain rounded" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Order"
        message="This will permanently delete the order and all its items. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteId) {
            handleDeleteOrder(deleteId);
            setDeleteId(null);
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
