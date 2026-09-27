import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Store, CheckCircle } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const RetailSalesPage = () => {
  const [data, setData] = useState({ customers: [], leads: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegment();
  }, []);

  const loadSegment = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getSalesSegment('RETAIL');
      setData(res.data || { customers: [], leads: [], orders: [] });
    } catch (err) {
      toast.error('Failed to load retail sales data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Direct Retail & Multi-Brand Outlets (MBO)"
          subtitle="Brand stores, franchise retail partners, POS billing summaries, and footwear/apparel SKU replenishment."
          breadcrumbs={[{ label: 'Commercial Sales' }, { label: 'Retail Sales' }]}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Store Code</th>
                <th className="px-5 py-3">Retail Store / Brand Outlet</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Account Type</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading retail network...</td>
                </tr>
              ) : data.customers?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No retail stores registered.</td>
                </tr>
              ) : (
                data.customers?.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{c.customer_code}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{c.company_name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{c.city || 'Metro Mall'}</td>
                    <td className="px-5 py-3.5 text-xs">Franchise MBO</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        {c.status || 'active'}
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

export default RetailSalesPage;
