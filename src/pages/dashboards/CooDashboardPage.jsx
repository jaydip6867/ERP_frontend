import React, { useState, useEffect } from 'react';
import { Layers, Truck, CheckCircle2, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CooDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getCoo();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load COO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Operating Officer (COO) Operations Center"
          subtitle="Shop floor production batches, open procurement POs, inventory risk alerts, and first-pass quality yield."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'COO Dashboard' }]}
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shop Floor Batches</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.operations?.activeProductionJobs || 0} Work Orders
          </div>
          <div className="text-xs text-slate-400 mt-1">Spinning, cutting & sewing</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Procurement Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.operations?.openPurchaseOrders || 0} POs Active
          </div>
          <div className="text-xs text-slate-400 mt-1">Yarn, chemicals & dyes</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OTIF Delivery Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{data?.operations?.otifRate || '96.2%'}</div>
          <div className="text-xs text-slate-400 mt-1">On-Time In-Full client fulfillment</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">First-Pass QC Yield</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{data?.operations?.firstPassQCYield || '98.4%'}</div>
          <div className="text-xs text-slate-400 mt-1">Zero-defect manufacturing KPI</div>
        </div>
      </div>
    </div>
  );
};

export default CooDashboardPage;
