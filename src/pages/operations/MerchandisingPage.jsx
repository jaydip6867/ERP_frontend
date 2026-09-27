import React, { useState, useEffect } from 'react';
import { Package, Search, Tag, ExternalLink } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const MerchandisingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getMerchandising();
      setProducts(res.data?.products || []);
    } catch (err) {
      toast.error('Failed to load merchandising catalog');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => 
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Apparel Product Merchandising & Tech Packs"
          subtitle="Style specifications, bill of materials, colorway assortments, and merchandising lifecycle."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Merchandising' }]}
        />
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKUs, product names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Selling Price</th>
                <th className="px-5 py-3">Cost Price</th>
                <th className="px-5 py-3">Merchandising Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No merchandising products found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{p.sku}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{p.product_name}</td>
                    <td className="px-5 py-3.5 font-mono">₹{(p.selling_price || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">₹{(p.cost_price || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 text-emerald-700">
                        {p.merchandising_status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchandisingPage;
