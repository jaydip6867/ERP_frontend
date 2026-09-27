import React, { useState, useEffect } from 'react';
import { Target, AlertCircle, CheckCircle, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CeoDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getCeo();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load CEO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Executive Officer (CEO) Command Center"
          subtitle="Cross-functional alignment, C-suite execution bottlenecks, enterprise KPIs, and operational velocity."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'CEO Dashboard' }]}
        />
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base">CEO Action Items & Executive Alerts</h3>
        <div className="space-y-2">
          {data?.ceoAlerts?.map((alt) => (
            <div key={alt.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-3">
              <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase mt-0.5 ${
                alt.type === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                alt.type === 'APPROVAL' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {alt.type}
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">{alt.title}</div>
                <div className="text-xs text-slate-600 mt-0.5">{alt.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Revenue</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ₹{(data?.kpis?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">{data?.performanceMetrics?.revenueGrowthRate || '+18.4%'}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Profit</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            ₹{(data?.kpis?.estimatedProfit || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Margin: {data?.performanceMetrics?.grossMarginPercent || '38.2%'}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Efficiency</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {data?.performanceMetrics?.operationalEfficiency || '94.5%'}
          </div>
          <div className="text-xs text-slate-400 mt-1">On-time in-full delivery</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Organization Staff</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.kpis?.totalEmployees || 0} Staff
          </div>
          <div className="text-xs text-slate-400 mt-1">Full-time payroll employees</div>
        </div>
      </div>
    </div>
  );
};

export default CeoDashboardPage;
