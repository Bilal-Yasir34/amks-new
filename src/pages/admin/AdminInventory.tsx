import { useEffect, useState, useCallback } from 'react';
import { Search, AlertTriangle, Plus, Minus, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [page, setPage] = useState(1);
  const [adjustments, setAdjustments] = useState<Record<string, number | undefined>>({});
  const pageSize = 15;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, category:categories(*)').eq('archived', false).order('name');
    setProducts((data || []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku || '').toLowerCase().includes(q)) return false;
    }
    if (filter === 'low') return p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
    if (filter === 'out') return p.stock_quantity <= 0;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const adjustStock = async (product: Product, newStock: number) => {
    const clamped = Math.max(0, newStock);
    const { error } = await supabase.from('products').update({ stock_quantity: clamped }).eq('id', product.id);
    if (error) toast.error('Failed to update stock.');
    else {
      setProducts(products.map((p) => p.id === product.id ? { ...p, stock_quantity: clamped } : p));
      toast.success(`Stock updated to ${clamped}.`);
    }
  };

  const applyAdjustment = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const adj = adjustments[productId];
    if (adj === undefined) return;
    const newStock = Math.max(0, product.stock_quantity + adj);
    await adjustStock(product, newStock);
    setAdjustments({ ...adjustments, [productId]: undefined });
  };

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length,
    outOfStock: products.filter((p) => p.stock_quantity <= 0).length,
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light mb-8">Inventory Management</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border border-ink-100">
          <p className="text-2xl font-medium">{stats.total}</p>
          <p className="text-xs text-ink-400 mt-0.5">Total Products</p>
        </div>
        <div className="bg-white p-4 border border-ink-100">
          <p className="text-2xl font-medium text-amber-600">{stats.lowStock}</p>
          <p className="text-xs text-ink-400 mt-0.5">Low Stock</p>
        </div>
        <div className="bg-white p-4 border border-ink-100">
          <p className="text-2xl font-medium text-red-600">{stats.outOfStock}</p>
          <p className="text-xs text-ink-400 mt-0.5">Out of Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input type="text" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white" />
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value as any); setPage(1); }} className="px-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white">
          <option value="all">All Products</option>
          <option value="low">Low Stock Only</option>
          <option value="out">Out of Stock Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-light text-xs text-ink-400 uppercase tracking-wider">
            <tr>
              <th className="text-left p-4 font-medium">Product</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">SKU</th>
              <th className="text-left p-4 font-medium">Current Stock</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Adjust</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-ink-400">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-ink-400">No products found.</td></tr>
            ) : (
              paginated.map((p) => {
                const isLow = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
                const isOut = p.stock_quantity <= 0;
                return (
                  <tr key={p.id} className="border-t border-ink-50 hover:bg-stone-light/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.featured_image || ''} alt="" className="w-10 h-12 object-cover bg-ink-50" />
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-ink-400">{p.category?.name || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-ink-500">{p.sku || '—'}</td>
                    <td className="p-4">
                      <span className={`font-medium ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : ''}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      {isOut ? (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Out of Stock</span>
                      ) : isLow ? (
                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700">Low Stock</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700">In Stock</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAdjustments({ ...adjustments, [p.id]: (adjustments[p.id] || 0) - 1 })} className="p-1 border border-ink-200 hover:bg-ink-100"><Minus className="w-3 h-3" /></button>
                        <input
                          type="number"
                          value={adjustments[p.id] ?? ''}
                          onChange={(e) => setAdjustments({ ...adjustments, [p.id]: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="w-14 px-2 py-1 text-sm border border-ink-200 text-center"
                        />
                        <button onClick={() => setAdjustments({ ...adjustments, [p.id]: (adjustments[p.id] || 0) + 1 })} className="p-1 border border-ink-200 hover:bg-ink-100"><Plus className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => applyAdjustment(p.id)}
                        disabled={adjustments[p.id] === undefined || adjustments[p.id] === 0}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-ink-900 text-white disabled:opacity-30 hover:bg-ink-700 transition-colors"
                      >
                        <Save className="w-3 h-3" /> Apply
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
