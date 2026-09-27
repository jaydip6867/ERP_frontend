import React, { useState, useEffect } from 'react';
import { Crown, DollarSign, TrendingUp, Users, Building, Layers, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const FounderDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getFounder();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load Founder cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Board & Founder Sovereign Cockpit"
          subtitle="Holistic group valuation, revenue velocity, EBITDA margin health, enterprise headcount, and long-term asset growth."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'Founder Dashboard' }]}
        />
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Cockpit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Group Revenue</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ₹{(data?.kpis?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">{data?.performanceMetrics?.revenueGrowthRate || '+18.4% YoY'}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Operating Profit</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            ₹{(data?.kpis?.estimatedProfit || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">EBITDA: {data?.performanceMetrics?.grossMarginPercent || '38.2%'}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount & Talent</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.kpis?.totalEmployees || 0} Staff
          </div>
          <div className="text-xs text-slate-400 mt-1">{data?.organization?.departments || 0} Departments Active</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Ecosystem</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {data?.kpis?.totalCustomers || 0} Clients
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">{data?.performanceMetrics?.customerRetentionRate || '91.8%'} Retention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-base">Group Working Capital Position</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Customer Receivables Outstanding</span>
              <span className="font-mono font-bold text-slate-900">₹{(data?.kpis?.receivables || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Committed Supplier Payables</span>
              <span className="font-mono font-bold text-slate-900">₹{(data?.kpis?.payables || 520000).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-lg">
              <span className="text-sm text-indigo-900 font-semibold">Net Treasury Floating Surplus</span>
              <span className="font-mono font-bold text-indigo-700">
                ₹{((data?.kpis?.receivables || 0) - (data?.kpis?.payables || 520000)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-base">Strategic Assets & Ecosystem</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-400">Active Product Lines</div>
              <div className="text-xl font-bold text-slate-900">{data?.organization?.activeProducts || 0} SKUs</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-400">NPD Innovation Pipeline</div>
              <div className="text-xl font-bold text-indigo-600">{data?.organization?.npdProjects || 0} In Flight</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-400">Manufacturing Branches</div>
              <div className="text-xl font-bold text-slate-900">{data?.organization?.branches || 1} Hubs</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-400">Integrated Tech Connectors</div>
              <div className="text-xl font-bold text-emerald-600">{data?.organization?.connectedIntegrations || 0} Live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderDashboardPage;
