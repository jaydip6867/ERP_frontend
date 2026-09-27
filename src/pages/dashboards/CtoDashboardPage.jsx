import React, { useState, useEffect } from 'react';
import { Cpu, Server, Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CtoDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getCto();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load CTO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Technology Officer (CTO) Infrastructure & Automation"
          subtitle="System uptime, database latency telemetry, external API connectors, and automation runs."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'CTO Dashboard' }]}
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ERP System SLA Uptime</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{data?.technology?.erpSystemUptime || '99.98%'}</div>
          <div className="text-xs text-slate-400 mt-1">High availability cluster</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Integrations</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.technology?.activeIntegrations || 0} APIs</div>
          <div className="text-xs text-slate-400 mt-1">Shopify, Razorpay, WhatsApp</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Automation Rules</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{data?.technology?.activeAutomationRules || 0} Workflows</div>
          <div className="text-xs text-slate-400 mt-1">Event-driven triggers active</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average API Latency</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{data?.technology?.averageApiResponseMs || 42} ms</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Optimal response threshold</div>
        </div>
      </div>
    </div>
  );
};

export default CtoDashboardPage;
