import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import type { Order } from '../types';
import Loader from '../components/Loader';

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    supabase.from('orders').select('*, order_items(*)').eq('order_number', orderNumber).maybeSingle().then(({ data }) => {
      setOrder(data as Order | null);
      setLoading(false);
    });
  }, [orderNumber]);

  if (loading) return <Loader text="Verifying order" />;

  return (
    <div className="section-padding py-20">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center justify-center w-20 h-20 mb-8"
        >
          <CheckCircle className="w-20 h-20 text-green-600" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="font-display text-4xl md:text-5xl font-light mb-4">
          Thank You!
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-sm text-ink-500 mb-8">
          Your order has been placed successfully. We will contact you shortly to confirm.
        </motion.p>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-stone-light p-6 mb-8 text-left">
            <div className="flex justify-between mb-4 pb-4 border-b border-ink-200">
              <span className="text-xs tracking-widest uppercase text-ink-400">Order Number</span>
              <span className="text-sm font-medium">{order.order_number}</span>
            </div>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-medium pt-4 mt-4 border-t border-ink-200">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-200 text-sm">
              <p className="text-ink-400">Payment Method: <span className="font-medium text-ink-900">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</span></p>
              <p className="text-ink-400 mt-1">Payment Status: <span className="font-medium text-ink-900 capitalize">{order.payment_status.replace(/_/g, ' ')}</span></p>
            </div>
          </motion.div>
        )}

        <Link to="/shop" className="btn-primary inline-flex">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
