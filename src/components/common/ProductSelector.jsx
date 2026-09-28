import React, { useState, useEffect } from 'react';
import { Search, Check, Package, X } from 'lucide-react';
import { productService } from '../../services/product.service';

export const ProductSelector = ({
  isOpen = true,
  onClose,
  onSelect,
  title = 'Select Product',
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, search, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        search,
        category_id: categoryFilter || undefined,
        limit: 50,
      });
      setProducts(res.data || []);
      if (categories.length === 0) {
        const catRes = await productService.getCategories();
        setCategories(catRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load products for selector:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 flex gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, code or SKU..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              autoFocus
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading catalog...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No matching products found.</div>
          ) : (
            products.map((p) => (
              <div
                key={p._id || p.id}
                onClick={() => {
                  onSelect(p);
                  onClose();
                }}
                className="p-3.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer transition flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{p.product_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {p.sku || p.product_code}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Category: {p.category_id?.category_name || '—'}</span>
                    <span>•</span>
                    <span>UOM: {p.uom_id?.uom_code || 'PCS'}</span>
                    <span>•</span>
                    <span className={`font-medium ${p.current_stock > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      Stock: {p.current_stock}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-900">₹{p.selling_rate?.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">GST: {p.gst_rate}%</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductSelector;
