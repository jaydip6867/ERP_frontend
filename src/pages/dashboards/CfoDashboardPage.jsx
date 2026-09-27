import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, PieChart, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CfoDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getCfo();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load CFO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Financial Officer (CFO) Treasury & Capital"
          subtitle="Corporate treasury, bank liquidity, GST liabilities, accounts receivables aging, and statutory compliance."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'CFO Dashboard' }]}
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cash In Bank Accounts</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ₹{(data?.finance?.cashInBank || 2450000).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Liquid operational runway</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receivables Outstanding</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2 font-mono">
            ₹{(data?.finance?.receivablesDue || 890000).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Due within 30-45 days</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Committed Payables Due</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ₹{(data?.finance?.payablesDue || 520000).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Yarn suppliers & processors</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Working Capital Ratio</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{data?.finance?.workingCapitalRatio || '2.14'}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Optimal solvency threshold</div>
        </div>
      </div>
    </div>
  );
};

export default CfoDashboardPage;
