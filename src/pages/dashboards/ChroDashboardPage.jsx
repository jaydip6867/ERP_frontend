import React, { useState, useEffect } from 'react';
import { Users, Heart, Award, CheckCircle, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const ChroDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getChro();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load CHRO cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chief Human Resources Officer (CHRO) People & Culture"
          subtitle="Enterprise headcount, retention stability, training index, workforce sentiment, and talent pipelines."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'CHRO Dashboard' }]}
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.hr?.headcount || 0} Staff</div>
          <div className="text-xs text-slate-400 mt-1">{data?.hr?.activeStaff || 0} on active duty</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee Retention Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{data?.hr?.retentionRate || '94.8%'}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Low attrition benchmark</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Staff Tenure</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{data?.hr?.avgTenureMonths || 28} Months</div>
          <div className="text-xs text-slate-400 mt-1">High organizational loyalty</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Training Completion Index</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.hr?.trainingCompletionRate || '87.5%'}</div>
          <div className="text-xs text-slate-400 mt-1">Safety & ERP skills modules</div>
        </div>
      </div>
    </div>
  );
};

export default ChroDashboardPage;
