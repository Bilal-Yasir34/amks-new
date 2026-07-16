import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, FolderTree, AlertTriangle, Ticket, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  couponCount: number;
  lowStock: any[];
  recentOrders: any[];
  recentProducts: any[];
  salesByDay: { date: string; total: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalProducts: 0, totalCategories: 0, totalOrders: 0, pendingOrders: 0,
    revenue: 0, couponCount: 0, lowStock: [], recentOrders: [], recentProducts: [], salesByDay: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [
        { count: prodCount },
        { count: catCount },
        { count: orderCount },
        { count: pendingCount },
        { data: orders },
        { count: couponCount },
        { data: lowStockData },
        { data: recentOrdersData },
        { data: recentProductsData },
        { data: recentSalesData },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('archived', false),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total, created_at'),
        supabase.from('coupons').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('id, name, sku, stock_quantity, low_stock_threshold, featured_image').eq('archived', false).limit(5),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id, name, featured_image, regular_price, sale_price, created_at').eq('archived', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('total, created_at').order('created_at', { ascending: false }).limit(30),
      ]);

      const revenue = (orders || []).reduce((sum, o) => sum + (o as any).total, 0);

      // Low stock: filter by threshold
      const lowStock = (lowStockData || []).filter((p: any) => p.stock_quantity <= p.low_stock_threshold);

      // Sales by day (last 7 days)
      const salesMap = new Map<string, number>();
      (recentSalesData || []).forEach((o: any) => {
        const day = new Date(o.created_at).toISOString().slice(0, 10);
        salesMap.set(day, (salesMap.get(day) || 0) + o.total);
      });
      const salesByDay: { date: string; total: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        salesByDay.push({ date: key, total: salesMap.get(key) || 0 });
      }

      setData({
        totalProducts: prodCount || 0,
        totalCategories: catCount || 0,
        totalOrders: orderCount || 0,
        pendingOrders: pendingCount || 0,
        revenue,
        couponCount: couponCount || 0,
        lowStock,
        recentOrders: (recentOrdersData || []) as any[],
        recentProducts: (recentProductsData || []) as any[],
        salesByDay,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: 'text-ink-700', link: '/admin/products' },
    { label: 'Total Categories', value: data.totalCategories, icon: FolderTree, color: 'text-purple-600', link: '/admin/categories' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingCart, color: 'text-blue-600', link: '/admin/orders' },
    { label: 'Pending Orders', value: data.pendingOrders, icon: Clock, color: 'text-amber-600', link: '/admin/orders' },
    { label: 'Revenue', value: formatPrice(data.revenue), icon: DollarSign, color: 'text-green-600', link: '/admin/orders' },
    { label: 'Coupons', value: data.couponCount, icon: Ticket, color: 'text-indigo-600', link: '/admin/coupons' },
    { label: 'Low Stock', value: data.lowStock.length, icon: AlertTriangle, color: 'text-red-600', link: '/admin/inventory' },
  ];

  const maxSale = Math.max(...data.salesByDay.map((d) => d.total), 1);

  if (loading) return <div className="py-20 text-center text-ink-400 text-sm">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-light mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link to={card.link} className="block bg-white p-5 border border-ink-100 hover:border-ink-300 transition-colors h-full">
              <card.icon className={`w-5 h-5 ${card.color} mb-3`} />
              <p className="text-xl font-medium">{card.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 border border-ink-100 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-ink-500" />
          <h2 className="text-sm font-medium">Sales Overview (Last 7 Days)</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {data.salesByDay.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.total / maxSale) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="w-full bg-ink-900 min-h-[2px] relative group"
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-ink-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatPrice(d.total)}
                </span>
              </motion.div>
              <span className="text-[10px] text-ink-400">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 border border-ink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-ink-400 hover:text-ink-900">View All</Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-ink-400">No orders yet.</p>
            ) : (
              data.recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center text-sm pb-3 border-b border-ink-50 last:border-0">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-ink-400">{order.customer_name} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <p className="text-xs text-ink-400 capitalize">{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 border border-ink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts</h2>
            <Link to="/admin/inventory" className="text-xs text-ink-400 hover:text-ink-900">View All</Link>
          </div>
          <div className="space-y-3">
            {data.lowStock.length === 0 ? (
              <p className="text-xs text-ink-400">All products are well stocked.</p>
            ) : (
              data.lowStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm pb-3 border-b border-ink-50 last:border-0">
                  <div className="flex items-center gap-2">
                    {p.featured_image && <img src={p.featured_image} alt="" className="w-8 h-8 object-cover bg-ink-50" />}
                    <div>
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs text-ink-400">{p.sku || 'No SKU'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${p.stock_quantity <= 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {p.stock_quantity} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white p-6 border border-ink-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Recent Products</h2>
            <Link to="/admin/products" className="text-xs text-ink-400 hover:text-ink-900">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {data.recentProducts.length === 0 ? (
              <p className="text-xs text-ink-400 col-span-5">No products yet.</p>
            ) : (
              data.recentProducts.map((p) => (
                <div key={p.id} className="text-center">
                  <img src={p.featured_image || ''} alt={p.name} className="w-full aspect-[3/4] object-cover bg-ink-50 mb-2" />
                  <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-ink-400">{formatPrice(p.sale_price || p.regular_price)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
