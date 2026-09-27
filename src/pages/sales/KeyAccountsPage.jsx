import React, { useState, useEffect } from 'react';
import { Crown, Search, Plus, ShieldCheck, DollarSign } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const KeyAccountsPage = () => {
  const [data, setData] = useState({ customers: [], leads: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegment();
  }, []);

  const loadSegment = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getSalesSegment('KEY_ACCOUNTS');
      setData(res.data || { customers: [], leads: [], orders: [] });
    } catch (err) {
      toast.error('Failed to load key accounts portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Key Accounts Management (KAM Portfolio)"
          subtitle="Strategic enterprise clients, dedicated account directors, high-value annual contracts, and SLA reviews."
          breadcrumbs={[{ label: 'Commercial Sales' }, { label: 'Key Accounts' }]}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Key Account</th>
                <th className="px-5 py-3">Account Owner / KAM</th>
                <th className="px-5 py-3">Contract Validity</th>
                <th className="px-5 py-3">Annual Credit Limit</th>
                <th className="px-5 py-3">Priority Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading strategic KAM portfolio...</td>
                </tr>
              ) : data.customers?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No key strategic accounts mapped.</td>
                </tr>
              ) : (
                data.customers?.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                      {c.company_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{c.contact_person || 'Senior KAM Director'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {c.contract_start_date ? new Date(c.contract_start_date).toLocaleDateString() : 'Annual'} - {c.contract_end_date ? new Date(c.contract_end_date).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      ₹{(c.credit_limit || 5000000).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800">
                        Tier 1 Platinum
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

export default KeyAccountsPage;
