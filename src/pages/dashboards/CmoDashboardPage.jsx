import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Megaphone, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CmoDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getCmo();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load CMO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Marketing Officer (CMO) Brand Command"
          subtitle="Campaign budgets vs actual media spend, cost per lead, ROAS performance, and creative pipeline."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'CMO Dashboard' }]}
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Campaigns</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.overview?.activeCampaigns || 0} Live</div>
          <div className="text-xs text-slate-400 mt-1">Paid search, social & outdoor</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Marketing Budget</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ₹{(data?.overview?.totalBudget || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Approved quarterly ceiling</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Media Spend Consumed</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2 font-mono">
            ₹{(data?.overview?.totalSpend || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Paid ad networks & agencies</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average ROAS Efficiency</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{data?.overview?.roas || '4.8x'}</div>
          <div className="text-xs text-slate-400 mt-1">Avg CPL: {data?.overview?.averageCPL || '₹ 240'}</div>
        </div>
      </div>
    </div>
  );
};

export default CmoDashboardPage;
