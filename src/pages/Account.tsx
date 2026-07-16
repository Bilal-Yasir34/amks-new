import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import type { Order, Address } from '../types';
import toast from 'react-hot-toast';

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tab, setTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: orderData } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      setOrders((orderData || []) as Order[]);
      const { data: addrData } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setAddresses((addrData || []) as Address[]);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out.');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400 mb-4">Please sign in to view your account.</p>
        <Link to="/login" className="btn-outline">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="section-padding py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <h1 className="font-display text-4xl font-light mb-2">My Account</h1>
          <p className="text-sm text-ink-400">{user.email}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-ink-100 mb-8">
          {[
            { key: 'orders', label: 'Orders', icon: Package },
            { key: 'addresses', label: 'Addresses', icon: MapPin },
            { key: 'profile', label: 'Profile', icon: User },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 pb-4 text-sm transition-colors ${tab === t.key ? 'text-ink-900 border-b-2 border-ink-900 -mb-px' : 'text-ink-400 hover:text-ink-900'}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-12">You have no orders yet.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-ink-100 p-5">
                  <div className="flex flex-wrap justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-ink-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                      <p className="text-xs text-ink-400 capitalize">{order.status} · {order.payment_method === 'cod' ? 'COD' : 'Bank Transfer'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-ink-500">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Addresses */}
        {tab === 'addresses' && (
          <div>
            {addresses.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-12">No saved addresses.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-ink-100 p-5">
                    <p className="text-sm font-medium">{addr.recipient_name}</p>
                    <p className="text-xs text-ink-500 mt-1">{addr.address}</p>
                    <p className="text-xs text-ink-500">{addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}</p>
                    <p className="text-xs text-ink-500 mt-1">{addr.phone}</p>
                    {addr.is_default && <span className="inline-block text-xs text-ink-900 mt-2">Default</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs text-ink-400 block mb-2">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <button onClick={handleSignOut} className="btn-outline">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
