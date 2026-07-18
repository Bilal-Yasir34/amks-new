import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import type { CustomerSummary, Order, Address } from '../../types';
import Pagination from '../../components/admin/Pagination';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<Address[]>([]);
  const pageSize = 15;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('customer_summary').select('*');
      if (error) {
        // Fallback: query orders directly
        const { data: orders } = await supabase.from('orders').select('customer_email, customer_name, customer_phone, total, created_at');
        const map = new Map<string, CustomerSummary>();
        (orders || []).forEach((o: any) => {
          const existing = map.get(o.customer_email);
          if (existing) {
            existing.total_orders++;
            existing.lifetime_spending += o.total;
            existing.last_order_date = o.created_at > existing.last_order_date ? o.created_at : existing.last_order_date;
          } else {
            map.set(o.customer_email, {
              customer_email: o.customer_email,
              name: o.customer_name,
              phone: o.customer_phone,
              total_orders: 1,
              lifetime_spending: o.total,
              first_order_date: o.created_at,
              last_order_date: o.created_at,
            });
          }
        });
        setCustomers(Array.from(map.values()));
      } else {
        setCustomers((data || []) as CustomerSummary[]);
      }
      setLoading(false);
    })();
  }, []);

  const openCustomer = async (c: CustomerSummary) => {
    setSelected(c);
    const [{ data: orders }, { data: addrs }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').eq('customer_email', c.customer_email).order('created_at', { ascending: false }),
      supabase.from('addresses').select('*').eq('user_id', (await supabase.from('orders').select('user_id').eq('customer_email', c.customer_email).not('user_id', 'is', null).limit(1).maybeSingle()).data?.user_id || ''),
    ]);
    setCustomerOrders((orders || []) as Order[]);
    setCustomerAddresses((addrs || []) as Address[]);
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.customer_email.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h1 className="font-display text-3xl font-light mb-8">Customers</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
        <input type="text" placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white" />
      </div>

      <div className="bg-white border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-light text-xs text-ink-400 uppercase tracking-wider">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Phone</th>
              <th className="text-left p-4 font-medium">Orders</th>
              <th className="text-left p-4 font-medium">Lifetime Spending</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">Last Order</th>
              <th className="text-right p-4 font-medium">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-ink-400">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-ink-400">No customers found.</td></tr>
            ) : (
              paginated.map((c) => (
                <tr key={c.customer_email} className="border-t border-ink-50 hover:bg-stone-light/50 cursor-pointer" onClick={() => openCustomer(c)}>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 hidden sm:table-cell text-ink-500">{c.customer_email}</td>
                  <td className="p-4 hidden md:table-cell text-ink-500">{c.phone}</td>
                  <td className="p-4">{c.total_orders}</td>
                  <td className="p-4 font-medium">{formatPrice(c.lifetime_spending)}</td>
                  <td className="p-4 hidden lg:table-cell text-ink-400">{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : '—'}</td>
                  <td className="p-4 text-right text-ink-400">→</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Customer detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-ink-900/50 z-[80]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[90] overflow-y-auto">
              <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-ink-100">
                <h2 className="font-display text-2xl font-light">{selected.name}</h2>
                <button onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                {/* Contact */}
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Contact Details</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-ink-400" /> {selected.customer_email}</p>
                    <p className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-ink-400" /> {selected.phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-light p-4">
                    <div className="flex items-center gap-2 mb-1"><ShoppingBag className="w-4 h-4 text-ink-500" /><span className="text-xs text-ink-400">Total Orders</span></div>
                    <p className="text-xl font-medium">{selected.total_orders}</p>
                  </div>
                  <div className="bg-stone-light p-4">
                    <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-ink-500" /><span className="text-xs text-ink-400">Lifetime Spending</span></div>
                    <p className="text-xl font-medium">{formatPrice(selected.lifetime_spending)}</p>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Order History</h3>
                  <div className="space-y-3">
                    {customerOrders.length === 0 ? (
                      <p className="text-xs text-ink-400">No orders.</p>
                    ) : (
                      customerOrders.map((o) => (
                        <div key={o.id} className="flex justify-between items-center text-sm pb-3 border-b border-ink-50 last:border-0">
                          <div>
                            <p className="font-medium">{o.order_number}</p>
                            <p className="text-xs text-ink-400">{new Date(o.created_at).toLocaleDateString()} · {o.status}</p>
                          </div>
                          <span className="font-medium">{formatPrice(o.total)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-medium mb-3 text-ink-400">Saved Addresses</h3>
                  {customerAddresses.length === 0 ? (
                    <p className="text-xs text-ink-400">No saved addresses.</p>
                  ) : (
                    <div className="space-y-3">
                      {customerAddresses.map((a) => (
                        <div key={a.id} className="border border-ink-100 p-3">
                          <p className="text-sm font-medium">{a.recipient_name}</p>
                          <p className="text-xs text-ink-500">{a.address}, {a.city}</p>
                          <p className="text-xs text-ink-500">{a.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
