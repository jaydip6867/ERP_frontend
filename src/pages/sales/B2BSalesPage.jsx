import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, DollarSign, Users, ExternalLink } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const B2BSalesPage = () => {
  const [data, setData] = useState({ customers: [], leads: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSegment();
  }, []);

  const loadSegment = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getSalesSegment('B2B');
      setData(res.data || { customers: [], leads: [], orders: [] });
    } catch (err) {
      toast.error('Failed to load B2B segment accounts');
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.customers?.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="B2B Institutional & Corporate Sales"
          subtitle="Corporate uniforms, industrial orders, export contracts, and institutional procurement."
          breadcrumbs={[{ label: 'Commercial Sales' }, { label: 'B2B Sales' }]}
        />
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search B2B accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">B2B Corporate Clients</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data.customers?.length || 0} Accounts</div>
          <div className="text-xs text-slate-400 mt-1">Direct institutional buyers</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active B2B Sales Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data.orders?.length || 0} Orders</div>
          <div className="text-xs text-slate-400 mt-1">Under production & dispatch</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospect Inquiries</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{data.leads?.length || 0} Leads</div>
          <div className="text-xs text-slate-400 mt-1">In RFQ quotation negotiation</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Account Code</th>
                <th className="px-5 py-3">Enterprise Client</th>
                <th className="px-5 py-3">Industry</th>
                <th className="px-5 py-3">Credit Limit</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading B2B database...</td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No B2B accounts registered.</td>
                </tr>
              ) : (
                filtered?.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{c.customer_code}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{c.company_name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{c.industry || 'Textile / Garments'}</td>
                    <td className="px-5 py-3.5 font-mono">₹{(c.credit_limit || 0).toLocaleString('en-IN')}</td>
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

export default B2BSalesPage;
