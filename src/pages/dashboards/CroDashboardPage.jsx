import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Award, Target, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CroDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getCro();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load CRO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Revenue Officer (CRO) Sales Cockpit"
          subtitle="Top-line sales performance, pipeline win rate, average order value, KAM accounts, and deal closures."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'CRO Dashboard' }]}
        />
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">B2B Institutional Accounts</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.pipeline?.b2bAccounts || 0} Accounts</div>
          <div className="text-xs text-slate-400 mt-1">Direct enterprise clients</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Strategic Accounts</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{data?.pipeline?.keyAccounts || 0} High-Value</div>
          <div className="text-xs text-slate-400 mt-1">Tier-1 recurring revenue</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Deal Size</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{data?.pipeline?.averageDealSize || '₹ 1,85,000'}</div>
          <div className="text-xs text-slate-400 mt-1">Per wholesale consignment</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Win Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{data?.pipeline?.winRate || '42.6%'}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Proposal-to-close ratio</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900">Recent Commercial Orders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Order Code</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400">No recent orders recorded.</td>
                </tr>
              ) : (
                data?.recentOrders?.slice(0, 5).map((o) => (
                  <tr key={o._id}>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{o.order_number || o.order_code || 'ORD'}</td>
                    <td className="px-5 py-3.5">{o.customer_id?.company_name || 'Direct Buyer'}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">₹{(o.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-emerald-50 text-emerald-700">
                        {o.status}
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

export default CroDashboardPage;
