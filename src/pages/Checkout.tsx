import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, PAYMENT_BUCKET } from '../lib/supabase';
import { useCartStore } from '../store/cart';
import { useAuth } from '../context/AuthContext';
import { formatPrice, generateOrderNumber } from '../lib/utils';
import toast from 'react-hot-toast';
import type { Settings } from '../types';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, couponCode, couponDiscount, clearCart } = useCartStore();
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '', notes: '',
  });

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as Settings);
    });
  }, []);

  const sub = subtotal();
  const discount = couponDiscount;
  const shipping = sub >= (settings?.free_shipping_threshold || 5000) ? 0 : (settings?.shipping_charge || 250);
  const total = sub - discount + shipping;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400 mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setScreenshotFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'bank_transfer' && !transactionId.trim()) {
      toast.error('Please enter the transaction/reference ID.');
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      let screenshotUrl: string | null = null;

      if (screenshotFile) {
        const fileName = `${orderNumber}-${Date.now()}.${screenshotFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from(PAYMENT_BUCKET).upload(fileName, screenshotFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(PAYMENT_BUCKET).getPublicUrl(fileName);
          screenshotUrl = urlData.publicUrl;
        }
      }

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        city: form.city,
        postal_code: form.postalCode,
        order_notes: form.notes,
        subtotal: sub,
        discount,
        shipping,
        total,
        coupon_code: couponCode,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending_verification' : 'pending_verification',
        transaction_id: paymentMethod === 'bank_transfer' ? transactionId : null,
        payment_screenshot: screenshotUrl,
        status: 'pending',
      }).select().single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        variant_combination_id: item.variant_combination_id,
        variant_description: item.variant_description,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      }));
      await supabase.from('order_items').insert(orderItems);

      // Record coupon usage
      if (couponCode) {
        const { data: coupon } = await supabase.from('coupons').select('id').eq('code', couponCode).maybeSingle();
        if (coupon) {
          await supabase.from('coupon_usage').insert({ coupon_id: coupon.id, order_id: order.id, user_id: user?.id || null });
        }
      }

      // Deduct stock
      for (const item of items) {
        if (item.variant_combination_id) {
          await supabase.rpc('deduct_variant_stock', { combo_id: item.variant_combination_id, qty: item.quantity }).then(() => {});
          // Fallback: direct update
          const { data: combo } = await supabase.from('product_variant_combinations').select('stock_quantity').eq('id', item.variant_combination_id).maybeSingle();
          if (combo) {
            await supabase.from('product_variant_combinations').update({ stock_quantity: Math.max(0, (combo as any).stock_quantity - item.quantity) }).eq('id', item.variant_combination_id);
          }
        } else {
          const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).maybeSingle();
          if (prod) {
            await supabase.from('products').update({ stock_quantity: Math.max(0, (prod as any).stock_quantity - item.quantity) }).eq('id', item.product_id);
          }
        }
      }

      clearCart();
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-padding py-12">
      <h1 className="font-display text-3xl md:text-4xl font-light mb-10 text-center">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: form */}
        <div className="space-y-8">
          {/* Customer details */}
          <div>
            <h2 className="text-xs tracking-widest uppercase font-medium mb-5 pb-3 border-b border-ink-100">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-ink-400 block mb-2">Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-2">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-2">Phone *</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-2">City *</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h2 className="text-xs tracking-widest uppercase font-medium mb-5 pb-3 border-b border-ink-100">Shipping Address</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-ink-400 block mb-2">Address *</label>
                <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field resize-none" />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-2">Postal Code</label>
                <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-2">Order Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-xs tracking-widest uppercase font-medium mb-5 pb-3 border-b border-ink-100">Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-400'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 accent-ink-900" />
                <div>
                  <span className="text-sm font-medium">Cash on Delivery</span>
                  <p className="text-xs text-ink-400 mt-1">Pay with cash when your order is delivered.</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'bank_transfer' ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-400'}`}>
                <input type="radio" name="payment" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="mt-1 accent-ink-900" />
                <div>
                  <span className="text-sm font-medium">Bank Transfer</span>
                  <p className="text-xs text-ink-400 mt-1">Transfer to our bank account and upload your receipt.</p>
                </div>
              </label>

              {paymentMethod === 'bank_transfer' && settings && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-stone-light p-5 space-y-3 text-sm">
                  {settings.payment_instructions && <p className="text-ink-500 text-xs italic mb-3">{settings.payment_instructions}</p>}
                  {settings.bank_name && (<div className="flex justify-between"><span className="text-ink-400">Bank Name</span><span className="font-medium">{settings.bank_name}</span></div>)}
                  {settings.bank_account_title && (<div className="flex justify-between"><span className="text-ink-400">Account Title</span><span className="font-medium">{settings.bank_account_title}</span></div>)}
                  {settings.bank_account_number && (<div className="flex justify-between"><span className="text-ink-400">Account Number</span><span className="font-medium">{settings.bank_account_number}</span></div>)}
                  {settings.bank_iban && (<div className="flex justify-between"><span className="text-ink-400">IBAN</span><span className="font-medium">{settings.bank_iban}</span></div>)}
                  {settings.bank_branch_code && (<div className="flex justify-between"><span className="text-ink-400">Branch Code</span><span className="font-medium">{settings.bank_branch_code}</span></div>)}
                  <div className="pt-4 border-t border-ink-200">
                    <label className="text-xs tracking-widest uppercase font-medium block mb-2">Transaction ID / Reference Number *</label>
                    <input required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="input-field" placeholder="Enter your transaction reference" />
                  </div>
                  <div className="pt-2">
                    <label className="text-xs tracking-widest uppercase font-medium block mb-2">Payment Screenshot (optional)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-ink-500 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-ink-900 file:text-white file:text-xs file:cursor-pointer" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div>
          <div className="bg-stone-light p-6 lg:p-8 sticky top-24">
            <h2 className="text-xs tracking-widest uppercase font-medium mb-5">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.variant_combination_id}`} className="flex gap-3">
                  <img src={item.image_url} alt={item.name} className="w-16 h-20 object-cover bg-white" />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    {item.variant_description && <p className="text-xs text-ink-400">{item.variant_description}</p>}
                    <p className="text-xs text-ink-400 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm pt-4 border-t border-ink-200">
              <div className="flex justify-between text-ink-500"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount {couponCode ? `(${couponCode})` : ''}</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-ink-500"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-medium text-base pt-3 border-t border-ink-200"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-6">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="text-xs text-ink-400 text-center mt-4">By placing your order, you agree to our terms and conditions.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
