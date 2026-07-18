import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '../store/cart';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal, couponCode, couponDiscount, applyCoupon, removeCoupon } = useCartStore();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const sub = subtotal();
  const discount = couponDiscount;
  const shipping = sub > 0 ? (sub >= 5000 ? 0 : 250) : 0;
  const total = sub - discount + shipping;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.trim().toUpperCase())
      .eq('is_enabled', true)
      .maybeSingle();

    if (error || !data) {
      toast.error('Invalid or expired coupon code.');
      setApplying(false);
      return;
    }

    const coupon = data as any;
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      toast.error('This coupon has expired.');
      setApplying(false);
      return;
    }
    if (coupon.minimum_purchase && sub < coupon.minimum_purchase) {
      toast.error(`Minimum purchase of ${formatPrice(coupon.minimum_purchase)} required.`);
      setApplying(false);
      return;
    }

    let disc = 0;
    if (coupon.discount_type === 'percentage') {
      disc = (sub * coupon.discount_value) / 100;
      if (coupon.maximum_discount) disc = Math.min(disc, coupon.maximum_discount);
    } else {
      disc = coupon.discount_value;
    }
    applyCoupon(coupon.code, Math.round(disc));
    toast.success(`Coupon "${coupon.code}" applied!`);
    setCouponInput('');
    setApplying(false);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-ink-900/50 z-[60] backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-ink-100">
              <h2 className="font-display text-xl tracking-wide flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Shopping Cart
              </h2>
              <button onClick={closeCart} aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-ink-200 mb-4" />
                  <p className="text-ink-400 text-sm mb-6">Your cart is empty.</p>
                  <Link to="/shop" onClick={closeCart} className="btn-outline text-xs">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.product_id}-${item.variant_combination_id}`} className="flex gap-4">
                    <Link to={`/product/${item.slug}`} onClick={closeCart} className="shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-20 h-24 object-cover bg-ink-50" />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <Link to={`/product/${item.slug}`} onClick={closeCart} className="text-sm font-medium hover:text-ink-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      {item.variant_description && (
                        <p className="text-xs text-ink-400 mt-0.5">{item.variant_description}</p>
                      )}
                      <p className="text-sm font-medium mt-1">{formatPrice(item.price)}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-ink-200">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_combination_id, item.quantity - 1)}
                            className="p-1.5 hover:bg-ink-50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_combination_id, item.quantity + 1)}
                            className="p-1.5 hover:bg-ink-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product_id, item.variant_combination_id)}
                          className="text-ink-300 hover:text-ink-900 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-ink-100 p-6 space-y-4">
                {/* Coupon */}
                {couponCode ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Coupon "{couponCode}" applied</span>
                    <button onClick={removeCoupon} className="text-xs underline text-ink-400 hover:text-ink-900">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 border border-ink-200 px-3 py-2 text-sm focus:border-ink-900 focus:outline-none"
                    />
                    <button type="submit" disabled={applying} className="btn-outline !px-4 !py-2 text-xs">
                      Apply
                    </button>
                  </form>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(sub)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-500">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-ink-100">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn-primary w-full">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
